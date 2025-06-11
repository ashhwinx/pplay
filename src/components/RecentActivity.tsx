import React from 'react';
import { Clock, Heart } from 'lucide-react';
import { useCouple } from '../contexts/CoupleContext';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const RecentActivity: React.FC = () => {
  const { activities, isConnected } = useCouple();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Clock className="h-6 w-6 text-primary-500 mr-2" />
        Recent Activity
      </h2>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No activities yet. Start playing together!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl flex-shrink-0">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                activity.type === 'game' ? 'bg-purple-100 text-purple-700' :
                activity.type === 'quiz' ? 'bg-blue-100 text-blue-700' :
                activity.type === 'journal' ? 'bg-green-100 text-green-700' :
                activity.type === 'gift' ? 'bg-pink-100 text-pink-700' :
                activity.type === 'watch' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {activity.type}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;