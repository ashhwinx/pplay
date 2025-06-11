import React, { useState } from 'react';
import { Gift, Heart, Calendar, Sparkles, Send, Clock, Star } from 'lucide-react';
import Layout from '../components/Layout';
import { useCouple } from '../contexts/CoupleContext';
import { format, addDays } from 'date-fns';

const GiftsPage: React.FC = () => {
  const [showSendGift, setShowSendGift] = useState(false);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('now');
  const [giftMessage, setGiftMessage] = useState('');
  const { updateActivity } = useCouple();

  const giftTypes = [
    {
      id: 'hug',
      name: 'Virtual Hug',
      emoji: '🤗',
      description: 'Send a warm, comforting hug',
      animation: 'bounce',
      color: 'bg-pink-100 text-pink-700'
    },
    {
      id: 'kiss',
      name: 'Sweet Kiss',
      emoji: '💋',
      description: 'A loving kiss to brighten their day',
      animation: 'pulse',
      color: 'bg-red-100 text-red-700'
    },
    {
      id: 'flowers',
      name: 'Digital Bouquet',
      emoji: '💐',
      description: 'Beautiful flowers that never wilt',
      animation: 'float',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'heart',
      name: 'Love Heart',
      emoji: '💖',
      description: 'Share your love with a beating heart',
      animation: 'pulse',
      color: 'bg-rose-100 text-rose-700'
    },
    {
      id: 'coffee',
      name: 'Coffee Date',
      emoji: '☕',
      description: 'Virtual coffee to start their morning',
      animation: 'bounce',
      color: 'bg-amber-100 text-amber-700'
    },
    {
      id: 'star',
      name: 'Shooting Star',
      emoji: '⭐',
      description: 'Make a wish together',
      animation: 'float',
      color: 'bg-yellow-100 text-yellow-700'
    }
  ];

  const sentGifts = [
    {
      id: '1',
      type: 'hug',
      message: 'Sending you the biggest hug! Miss you so much ❤️',
      deliveredAt: new Date('2024-12-17T08:30:00'),
      status: 'delivered',
      reaction: '🥰'
    },
    {
      id: '2',
      type: 'flowers',
      message: 'These remind me of our first date in the park',
      deliveredAt: new Date('2024-12-16T19:15:00'),
      status: 'delivered',
      reaction: '😍'
    },
    {
      id: '3',
      type: 'coffee',
      message: 'Good morning beautiful! Hope your day is amazing',
      scheduledFor: new Date('2024-12-18T07:00:00'),
      status: 'scheduled'
    }
  ];

  const receivedGifts = [
    {
      id: '1',
      type: 'kiss',
      from: 'Sarah',
      message: 'Just because I love you! 💕',
      receivedAt: new Date('2024-12-17T14:20:00'),
      isNew: true
    },
    {
      id: '2',
      type: 'heart',
      from: 'Sarah',
      message: 'Thank you for being so patient with me today',
      receivedAt: new Date('2024-12-16T21:30:00'),
      isNew: false
    }
  ];

  const handleSendGift = () => {
    if (selectedGift && giftMessage) {
      const gift = giftTypes.find(g => g.id === selectedGift);
      updateActivity({
        type: 'gift',
        description: `Sent a ${gift?.name} to Sarah`,
        icon: gift?.emoji || '🎁'
      });
      setShowSendGift(false);
      setSelectedGift(null);
      setGiftMessage('');
      setDeliveryDate('now');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 flex items-center">
            <Gift className="h-8 w-8 text-primary-500 mr-3" />
            Virtual Gifts
          </h1>
          <p className="text-gray-600">
            Send surprise gifts and sweet messages to brighten each other's day
          </p>
        </div>

        {/* Quick Send Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowSendGift(true)}
            className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold text-lg flex items-center mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Send className="h-6 w-6 mr-3" />
            Send a Gift
            <Sparkles className="h-6 w-6 ml-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Received Gifts */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Gifts Received
            </h2>
            <div className="space-y-4">
              {receivedGifts.map((gift) => {
                const giftType = giftTypes.find(g => g.id === gift.type);
                return (
                  <div
                    key={gift.id}
                    className={`bg-white rounded-2xl p-6 shadow-lg border transition-all hover:shadow-xl ${
                      gift.isNew ? 'border-primary-300 ring-2 ring-primary-100' : 'border-purple-100'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`text-4xl ${giftType?.animation === 'bounce' ? 'animate-bounce-slow' : giftType?.animation === 'pulse' ? 'animate-pulse-slow' : 'animate-float'}`}>
                        {giftType?.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900">{giftType?.name}</h3>
                          {gift.isNew && (
                            <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">{gift.message}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>From {gift.from}</span>
                          <span>{format(gift.receivedAt, 'MMM dd, h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sent Gifts */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Send className="h-5 w-5 text-blue-500 mr-2" />
              Gifts Sent
            </h2>
            <div className="space-y-4">
              {sentGifts.map((gift) => {
                const giftType = giftTypes.find(g => g.id === gift.type);
                return (
                  <div
                    key={gift.id}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`text-4xl ${giftType?.animation === 'bounce' ? 'animate-bounce-slow' : giftType?.animation === 'pulse' ? 'animate-pulse-slow' : 'animate-float'}`}>
                        {giftType?.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900">{giftType?.name}</h3>
                          <div className="flex items-center space-x-2">
                            {gift.status === 'delivered' && gift.reaction && (
                              <span className="text-lg">{gift.reaction}</span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              gift.status === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {gift.status === 'delivered' ? 'Delivered' : 'Scheduled'}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{gift.message}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>To Sarah</span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {gift.deliveredAt 
                              ? format(gift.deliveredAt, 'MMM dd, h:mm a')
                              : format(gift.scheduledFor!, 'MMM dd, h:mm a')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Send Gift Modal */}
        {showSendGift && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Sparkles className="h-6 w-6 text-primary-500 mr-2" />
                Send a Virtual Gift
              </h2>
              
              {/* Gift Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a Gift</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {giftTypes.map((gift) => (
                    <button
                      key={gift.id}
                      onClick={() => setSelectedGift(gift.id)}
                      className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                        selectedGift === gift.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{gift.emoji}</div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{gift.name}</h4>
                      <p className="text-xs text-gray-600">{gift.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message
                </label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Write a sweet message to go with your gift..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Delivery Time */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery
                </label>
                <select
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="now">Send Now</option>
                  <option value="morning">Tomorrow Morning (7 AM)</option>
                  <option value="evening">Tonight (8 PM)</option>
                  <option value="custom">Schedule for Later</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowSendGift(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendGift}
                  disabled={!selectedGift || !giftMessage}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Gift
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GiftsPage;