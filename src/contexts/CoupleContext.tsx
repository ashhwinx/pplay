import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { useAuth } from './AuthContext';
import { coupleAPI, activityAPI } from '../utils/api';
import socketManager from '../utils/socket';
import toast from 'react-hot-toast';

interface Partner {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

interface CoupleStats {
  daysTogether: number;
  hoursApart: number;
  nextMeeting: Date;
  sharedMemories: number;
  gamesPlayed: number;
  lovelettersShared: number;
  quizzesCompleted: number;
  giftsExchanged: number;
  moviesWatched: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  icon: string;
  userId?: string;
  user?: {
    name: string;
    avatar: string;
  };
}

interface CoupleContextType {
  partner: Partner | null;
  stats: CoupleStats;
  activities: Activity[];
  coupleId: string | null;
  isConnected: boolean;
  updateActivity: (activity: { type: string; description: string; icon: string; metadata?: any }) => void;
  connectWithPartner: (coupleCode: string) => Promise<boolean>;
  refreshCoupleData: () => Promise<void>;
  refreshActivities: () => Promise<void>;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const useCouple = () => {
  const context = useContext(CoupleContext);
  if (context === undefined) {
    throw new Error('useCouple must be used within a CoupleProvider');
  }
  return context;
};

interface CoupleProviderProps {
  children: ReactNode;
}

export const CoupleProvider: React.FC<CoupleProviderProps> = ({ children }) => {
  const { user, updateUser, refreshUser } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [stats, setStats] = useState<CoupleStats>({
    daysTogether: 0,
    hoursApart: 0,
    nextMeeting: new Date('2024-12-25'),
    sharedMemories: 0,
    gamesPlayed: 0,
    lovelettersShared: 0,
    quizzesCompleted: 0,
    giftsExchanged: 0,
    moviesWatched: 0
  });

  useEffect(() => {
    if (user?.coupleId && user?.partnerId) {
      setIsConnected(true);
      setCoupleId(user.coupleId);
      refreshCoupleData();
      refreshActivities();
      
      // Set up socket listeners for real-time updates
      setupSocketListeners();
    } else {
      setIsConnected(false);
      setPartner(null);
      setCoupleId(null);
      setActivities([]);
    }

    return () => {
      // Clean up socket listeners
      socketManager.off('partner_status');
      socketManager.off('new_activity');
      socketManager.off('gift_received');
      socketManager.off('partner_connected');
      socketManager.off('partner_disconnected');
      socketManager.off('journal_updated');
    };
  }, [user]);

  const setupSocketListeners = () => {
    // Partner connection updates
    socketManager.on('partner_connected', (data) => {
      console.log('Partner connected:', data);
      setPartner({
        id: data.partner.id,
        name: data.partner.name,
        avatar: data.partner.avatar,
        status: data.partner.isOnline ? 'online' : 'offline'
      });
      setCoupleId(data.coupleId);
      setIsConnected(true);
      
      // Refresh user data to get updated couple info
      refreshUser();
      
      toast.success(`Connected with ${data.partner.name}! 💕`);
    });

    // Partner status updates
    socketManager.on('partner_status', (data) => {
      if (data.userId === user?.partnerId) {
        setPartner(prev => prev ? { 
          ...prev, 
          status: data.status === 'online' ? 'online' : 'offline' 
        } : null);
      }
    });

    // New activity updates
    socketManager.on('new_activity', (data) => {
      console.log('New activity received:', data);
      setActivities(prev => [data.activity, ...prev.slice(0, 49)]);
    });

    // Gift notifications
    socketManager.on('gift_received', (data) => {
      toast.success(`You received a ${data.gift.type} from ${data.gift.sender?.name || 'your partner'}! 🎁`);
      refreshActivities();
    });

    // Partner disconnection
    socketManager.on('partner_disconnected', () => {
      setIsConnected(false);
      setPartner(null);
      setCoupleId(null);
      setActivities([]);
      toast.error('Your partner has disconnected');
    });

    // Journal updates
    socketManager.on('journal_updated', (data) => {
      toast.success('Your partner added a new memory! 📖');
      refreshActivities();
    });
  };

  const refreshCoupleData = async () => {
    try {
      const response = await coupleAPI.getInfo();
      const coupleData = response.data.couple;
      
      setCoupleId(coupleData.id);
      setIsConnected(true);
      setStats({
        ...coupleData.stats,
        hoursApart: differenceInHours(new Date(), new Date('2024-01-15')),
        nextMeeting: new Date('2024-12-25')
      });
      
      // Set partner info from user data
      if (user?.partnerId) {
        // Get partner info from the couple data or make a separate call
        const partnerInfo = user.partner || coupleData.partner;
        if (partnerInfo) {
          setPartner({
            id: partnerInfo.id,
            name: partnerInfo.name,
            avatar: partnerInfo.avatar,
            status: partnerInfo.isOnline ? 'online' : 'offline',
            lastSeen: partnerInfo.lastSeen ? new Date(partnerInfo.lastSeen) : undefined
          });
        }
      }
    } catch (error) {
      console.error('Failed to refresh couple data:', error);
    }
  };

  const refreshActivities = async () => {
    try {
      const response = await activityAPI.getAll({ limit: 50 });
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    }
  };

  const updateActivity = async (activity: { type: string; description: string; icon: string; metadata?: any }) => {
    try {
      await activityAPI.create(activity);
      // Activity will be updated via socket event
    } catch (error) {
      console.error('Failed to update activity:', error);
      // Add locally as fallback
      const newActivity: Activity = {
        id: Math.random().toString(36).substr(2, 9),
        ...activity,
        timestamp: new Date(),
        userId: user?.id,
        user: user ? { name: user.name, avatar: user.avatar || '' } : undefined
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 49)]);
    }
  };

  const connectWithPartner = async (coupleCode: string): Promise<boolean> => {
    try {
      console.log('Attempting to connect with couple code:', coupleCode);
      const response = await coupleAPI.connect(coupleCode);
      const { couple } = response.data;
      
      console.log('Connection response:', response.data);
      
      setCoupleId(couple.id);
      setIsConnected(true);
      
      // Update user with couple info
      updateUser({
        coupleId: couple.id,
        partnerId: couple.partner.id
      });
      
      // Set partner info
      setPartner({
        id: couple.partner.id,
        name: couple.partner.name,
        avatar: couple.partner.avatar,
        status: couple.partner.isOnline ? 'online' : 'offline',
        lastSeen: couple.partner.lastSeen ? new Date(couple.partner.lastSeen) : undefined
      });

      // Refresh data
      await refreshCoupleData();
      await refreshActivities();

      return true;
    } catch (error: any) {
      console.error('Failed to connect with partner:', error);
      const message = error.response?.data?.message || 'Failed to connect';
      toast.error(message);
      return false;
    }
  };

  const value = {
    partner,
    stats,
    activities,
    coupleId,
    isConnected,
    updateActivity,
    connectWithPartner,
    refreshCoupleData,
    refreshActivities
  };

  return (
    <CoupleContext.Provider value={value}>
      {children}
    </CoupleContext.Provider>
  );
};