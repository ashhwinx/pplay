import React, { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Heart, Home, Gamepad2, BookHeart, Users, Play, Gift, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCouple } from '../contexts/CoupleContext';
import clsx from 'clsx';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { partner } = useCouple();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/games', icon: Gamepad2, label: 'Games' },
    { path: '/quizzes', icon: Users, label: 'Quizzes' },
    { path: '/journal', icon: BookHeart, label: 'Journal' },
    { path: '/watch', icon: Play, label: 'Watch' },
    { path: '/gifts', icon: Gift, label: 'Gifts' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary-500 mr-2" />
              <span className="font-display font-bold text-xl text-gray-900">PairPlay</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={clsx(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
                    location.pathname === path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {partner && (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className={clsx(
                      'absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white',
                      partner.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                    )} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{partner.name}</span>
                </div>
              )}
              
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-200/50 z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.slice(0, 4).map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={clsx(
                'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors',
                location.pathname === path
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600'
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;