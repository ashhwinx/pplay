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
  const { user, updateUser } = useAuth();
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
    };
  }, [user]);

  const setupSocketListeners = () => {
    // Partner status updates
    socketManager.on('partner_status', (data) => {
      if (data.userId === user?.partnerId) {
        setPartner(prev => prev ? { ...prev, status: data.status } : null);
      }
    });

    // New activity updates
    socketManager.on('new_activity', (data) => {
      setActivities(prev => [data.activity, ...prev.slice(0, 49)]);
    });

    // Gift notifications
    socketManager.on('gift_received', (data) => {
      toast.success(`You received a ${data.gift.type} from ${data.gift.sender.name}! 🎁`);
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
      if (user?.partner) {
        setPartner({
          id: user.partner.id,
          name: user.partner.name,
          avatar: user.partner.avatar,
          status: user.partner.isOnline ? 'online' : 'offline',
          lastSeen: user.partner.lastSeen ? new Date(user.partner.lastSeen) : undefined
        });
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
      const response = await coupleAPI.connect(coupleCode);
      const { couple } = response.data;
      
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
        status: couple.partner.isOnline ? '온라인' : 'offline',
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