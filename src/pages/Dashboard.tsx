import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Heart, Gamepad2, BookHeart, Gift, Play, Users, Sparkles } from 'lucide-react';
import { useCouple } from '../contexts/CoupleContext';
import { format, formatDistanceToNow } from 'date-fns';
import Layout from '../components/Layout';
import CoupleConnection from '../components/CoupleConnection';
import RecentActivity from '../components/RecentActivity';
import AILoveLetterGenerator from '../components/AILoveLetterGenerator';
import clsx from 'clsx';

const Dashboard: React.FC = () => {
  const { partner, stats, isConnected } = useCouple();

  const quickActions = [
    {
      title: 'Play Games',
      description: 'Start a fun game together',
      icon: Gamepad2,
      path: '/games',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'Take Quiz',
      description: 'Test your couple knowledge',
      icon: Users,
      path: '/quizzes',
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600'
    },
    {
      title: 'Write Memory',
      description: 'Add to your shared journal',
      icon: BookHeart,
      path: '/journal',
      color: 'bg-rose-500',
      hoverColor: 'hover:bg-rose-600'
    },
    {
      title: 'Send Gift',
      description: 'Surprise your partner',
      icon: Gift,
      path: '/gifts',
      color: 'bg-violet-500',
      hoverColor: 'hover:bg-violet-600'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Welcome back! 💕
          </h1>
          <p className="text-gray-600">
            {isConnected && partner 
              ? `${partner.name} is ${partner.status}` 
              : 'Connect with your partner to get started'
            }
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-8">
            <CoupleConnection />
          </div>
        )}

        {isConnected && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.daysTogether}</h3>
                <p className="text-sm text-gray-600">Days Together</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{Math.floor(stats.hoursApart / 24)}</h3>
                <p className="text-sm text-gray-600">Days Apart</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <BookHeart className="h-8 w-8 text-rose-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.sharedMemories}</h3>
                <p className="text-sm text-gray-600">Memories</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <Gamepad2 className="h-8 w-8 text-violet-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.gamesPlayed}</h3>
                <p className="text-sm text-gray-600">Games Played</p>
              </div>
            </div>

            {/* Countdown to Next Meeting */}
            <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12">
                <Heart className="h-32 w-32 text-white/10" />
              </div>
              <div className="relative">
                <h2 className="text-2xl font-display font-bold mb-2">Next Meeting</h2>
                <p className="text-purple-100 mb-4">
                  {formatDistanceToNow(stats.nextMeeting)} to go!
                </p>
                <div className="text-3xl font-bold">
                  {format(stats.nextMeeting, 'MMMM do, yyyy')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Sparkles className="h-6 w-6 text-primary-500 mr-2" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.path}
                      className="group bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className={clsx(
                        'rounded-xl p-3 w-fit mb-4 transition-colors',
                        action.color,
                        action.hoverColor
                      )}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </Link>
                  ))}
                </div>

                {/* AI Love Letter Generator */}
                <AILoveLetterGenerator />
              </div>

              {/* Recent Activities */}
              <div>
                <RecentActivity />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;