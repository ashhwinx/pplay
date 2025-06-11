import React, { useState } from 'react';
import { User, Settings, Heart, Calendar, Trophy, Edit3, Camera, Bell, Shield, Palette } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useCouple } from '../contexts/CoupleContext';
import { format } from 'date-fns';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { user, logout } = useAuth();
  const { partner, stats } = useCouple();

  const achievements = [
    { id: '1', title: 'First Game', description: 'Played your first game together', icon: '🎮', earned: true },
    { id: '2', title: 'Memory Keeper', description: 'Added 10 memories to your journal', icon: '📖', earned: true },
    { id: '3', title: 'Quiz Master', description: 'Scored 90% or higher on a quiz', icon: '🧠', earned: true },
    { id: '4', title: 'Gift Giver', description: 'Sent 25 virtual gifts', icon: '🎁', earned: false },
    { id: '5', title: 'Movie Buff', description: 'Watched 10 movies together', icon: '🎬', earned: false },
    { id: '6', title: 'Love Letters', description: 'Generated 50 AI love letters', icon: '💌', earned: false }
  ];

  const relationshipMilestones = [
    { date: '2023-02-14', title: 'First Message', description: 'Started talking on PairPlay' },
    { date: '2023-02-20', title: 'First Video Call', description: 'Had your first video call' },
    { date: '2023-03-15', title: 'Relationship Official', description: 'Made it official!' },
    { date: '2023-06-10', title: 'First Meeting', description: 'Met in person for the first time' },
    { date: '2024-01-01', title: 'New Year Together', description: 'Celebrated New Year together' }
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'relationship', label: 'Relationship', icon: Heart },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12">
            <Heart className="h-32 w-32 text-white/10" />
          </div>
          <div className="relative flex items-center space-x-6">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b332c1cd?w=150&h=150&fit=crop&crop=face'}
                alt={user?.name}
                className="w-24 h-24 rounded-full border-4 border-white/20"
              />
              <button className="absolute bottom-0 right-0 bg-white text-primary-600 rounded-full p-2 hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold mb-2">{user?.name}</h1>
              <p className="text-purple-100 mb-4">{user?.email}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-purple-200">Together for</span>
                  <div className="font-semibold">{stats.daysTogether} days</div>
                </div>
                <div>
                  <span className="text-purple-200">Partner</span>
                  <div className="font-semibold">{partner?.name}</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-medium flex items-center"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{user?.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{user?.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partner</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900 flex items-center">
                    <img
                      src={partner?.avatar}
                      alt={partner?.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    {partner?.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship Status</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">In a relationship</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'relationship' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Relationship Timeline</h2>
              <div className="space-y-6">
                {relationshipMilestones.map((milestone, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-primary-100 rounded-full p-2 mt-1">
                      <Calendar className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                        <span className="text-sm text-gray-500">{format(new Date(milestone.date), 'MMM dd, yyyy')}</span>
                      </div>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      achievement.earned
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && (
                          <span className="inline-block mt-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                            Earned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Bell className="h-5 w-5 text-primary-500 mr-2" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Partner activity notifications</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Game invitations</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">New messages</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 text-primary-500 mr-2" />
                    Privacy
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Show online status</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Share activity status</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Palette className="h-5 w-5 text-primary-500 mr-2" />
                    Appearance
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>Auto</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      Change Password
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      Export Data
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    placeholder="Tell your partner something special about yourself..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 bg-primary-500 text-white py-3 px-4 rounded-xl hover:bg-primary-600 transition-colors font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;