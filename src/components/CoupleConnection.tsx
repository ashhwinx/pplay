import React, { useState } from 'react';
import { Heart, Copy, Users, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCouple } from '../contexts/CoupleContext';
import toast from 'react-hot-toast';

const CoupleConnection: React.FC = () => {
  const { user } = useAuth();
  const { connectWithPartner, isConnected } = useCouple();
  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (user?.coupleCode) {
      navigator.clipboard.writeText(user.coupleCode);
      setCopied(true);
      toast.success('Couple code copied! 📋');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectPartner = async () => {
    if (!partnerCode.trim()) {
      toast.error('Please enter your partner\'s couple code');
      return;
    }

    setLoading(true);
    try {
      const success = await connectWithPartner(partnerCode.toUpperCase());
      if (success) {
        toast.success('Successfully connected with your partner! 💕');
        setPartnerCode('');
      } else {
        toast.error('Invalid couple code. Please check and try again.');
      }
    } catch (error) {
      toast.error('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return null; // Don't show if already connected
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
          Connect with Your Partner
        </h2>
        <p className="text-gray-600">
          Share your couple code or enter your partner's code to start your journey together
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Share Your Code */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            Your Couple Code
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-primary-600 mb-2">
                {user?.coupleCode || 'LOADING...'}
              </div>
              <p className="text-sm text-gray-600">Share this code with your partner</p>
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            className="w-full bg-primary-500 text-white py-3 px-4 rounded-xl hover:bg-primary-600 transition-colors font-semibold flex items-center justify-center"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 mr-2" />
                Copy Code
              </>
            )}
          </button>
        </div>

        {/* Enter Partner's Code */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ArrowRight className="h-5 w-5 text-purple-500 mr-2" />
            Connect with Partner
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partner's Couple Code
              </label>
              <input
                type="text"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-center text-lg"
              />
            </div>
            <button
              onClick={handleConnectPartner}
              disabled={loading || partnerCode.length !== 6}
              className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Connect Now'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Once connected, you'll be able to play games, share memories, and enjoy all PairPlay features together! 💕
        </p>
      </div>
    </div>
  );
};

export default CoupleConnection;