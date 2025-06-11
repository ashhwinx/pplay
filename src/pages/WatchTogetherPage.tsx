import React, { useState, useRef, useEffect } from 'react';
import { Play, Users, MessageCircle, Smile, Volume2, Settings, Search, Plus, Pause, SkipForward, SkipBack } from 'lucide-react';
import Layout from '../components/Layout';
import { useCouple } from '../contexts/CoupleContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'reaction';
}

const WatchTogetherPage: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSynced, setIsSynced] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { partner, updateActivity, isConnected } = useCouple();

  const recommendations = [
    {
      id: '1',
      title: 'Romantic Movie Night',
      description: 'The Notebook - Perfect for a cozy night in',
      thumbnail: 'https://images.unsplash.com/photo-1489599117616-b2e8c6b94cb5?w=300&h=200&fit=crop',
      duration: '2h 3m',
      genre: 'Romance',
      type: 'movie',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: '2',
      title: 'Comedy Series',
      description: 'Friends - Season 1 Episode 1',
      thumbnail: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=300&h=200&fit=crop',
      duration: '22m',
      genre: 'Comedy',
      type: 'series',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: '3',
      title: 'Music Video',
      description: 'Your favorite love songs playlist',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
      duration: '3h 15m',
      genre: 'Music',
      type: 'playlist',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      id: '4',
      title: 'Documentary',
      description: 'Planet Earth - Nature at its finest',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
      duration: '50m',
      genre: 'Documentary',
      type: 'documentary',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    }
  ];

  const reactions = ['❤️', '😂', '😮', '😢', '👏', '🔥'];

  useEffect(() => {
    // Initialize with some sample messages
    setChatMessages([
      {
        id: '1',
        author: partner?.name || 'Sarah',
        message: 'This is so romantic! 😍',
        timestamp: new Date(Date.now() - 120000),
        type: 'message'
      },
      {
        id: '2',
        author: 'You',
        message: 'I knew you\'d love this scene',
        timestamp: new Date(Date.now() - 60000),
        type: 'message'
      },
      {
        id: '3',
        author: partner?.name || 'Sarah',
        message: 'We should recreate this dance!',
        timestamp: new Date(Date.now() - 30000),
        type: 'message'
      }
    ]);
  }, [partner]);

  const handleStartWatching = (videoId: string) => {
    if (!isConnected) {
      toast.error('Please connect with your partner first!');
      return;
    }

    setCurrentVideo(videoId);
    const video = recommendations.find(v => v.id === videoId);
    if (video) {
      updateActivity({
        type: 'watch',
        description: `Started watching "${video.title}" together`,
        icon: '📺'
      });
      
      // Simulate partner joining
      setTimeout(() => {
        toast.success(`${partner?.name} joined the watch party!`);
        addChatMessage(`${partner?.name} joined the watch party! 🎉`, partner?.name || 'Partner');
      }, 2000);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        toast.success('Video paused for both viewers');
      } else {
        videoRef.current.play();
        toast.success('Video playing for both viewers');
      }
      setIsPlaying(!isPlaying);
      
      // Simulate sync message
      addChatMessage(`${isPlaying ? 'Paused' : 'Playing'} video for everyone`, 'System');
    }
  };

  const addChatMessage = (message: string, author: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      author,
      message,
      timestamp: new Date(),
      type: 'message'
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      addChatMessage(chatMessage, 'You');
      setChatMessage('');
      
      // Simulate partner response
      setTimeout(() => {
        const responses = [
          'Haha, exactly!',
          'I love this part!',
          'So true! 😄',
          'This is amazing!',
          'Can\'t wait to see what happens next!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(randomResponse, partner?.name || 'Sarah');
      }, 1000 + Math.random() * 3000);
    }
  };

  const handleReaction = (emoji: string) => {
    const reactionMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'You',
      message: emoji,
      timestamp: new Date(),
      type: 'reaction'
    };
    setChatMessages(prev => [...prev, reactionMessage]);
    
    // Show floating reaction
    toast.success(`Reaction sent: ${emoji}`);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <div className="text-center py-16">
            <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect with Your Partner</h2>
            <p className="text-gray-600 mb-6">
              You need to connect with your partner before you can watch together.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 flex items-center">
            <Play className="h-8 w-8 text-primary-500 mr-3" />
            Watch Together
          </h1>
          <p className="text-gray-600">
            Sync your favorite movies, shows, and videos with your partner
          </p>
        </div>

        {currentVideo ? (
          /* Watch Mode */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-3">
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gray-900 relative">
                  <video
                    ref={videoRef}
                    src={recommendations.find(v => v.id === currentVideo)?.videoUrl}
                    className="w-full h-full object-cover"
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  
                  {/* Partner Status */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${isSynced ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    {partner?.name} is {isSynced ? 'synced' : 'syncing...'}
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center space-x-4 mb-3">
                      <button
                        onClick={handlePlayPause}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </button>
                      <button className="text-white hover:text-gray-300 transition-colors">
                        <SkipBack className="h-5 w-5" />
                      </button>
                      <button className="text-white hover:text-gray-300 transition-colors">
                        <SkipForward className="h-5 w-5" />
                      </button>
                      <button className="text-white hover:text-gray-300 transition-colors">
                        <Volume2 className="h-5 w-5" />
                      </button>
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      <div className="flex-1"></div>
                      <button
                        onClick={() => setShowSettings(true)}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        <Settings className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-1">
                      <div 
                        className="bg-primary-500 h-1 rounded-full transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Quick Reactions */}
                <div className="bg-gray-900 p-4 flex items-center justify-center space-x-3">
                  {reactions.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReaction(emoji)}
                      className="text-2xl hover:bg-gray-800 transition-colors p-2 rounded-lg"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Video Info */}
              <div className="bg-white rounded-2xl p-6 mt-4 shadow-lg border border-purple-100">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {recommendations.find(v => v.id === currentVideo)?.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {recommendations.find(v => v.id === currentVideo)?.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{recommendations.find(v => v.id === currentVideo)?.duration}</span>
                  <span>•</span>
                  <span>{recommendations.find(v => v.id === currentVideo)?.genre}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Watching with {partner?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 h-fit">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <MessageCircle className="h-5 w-5 text-primary-500 mr-2" />
                  Live Chat
                </h3>
              </div>
              
              <div className="p-4 h-80 overflow-y-auto space-y-3">
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.author === 'You' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'reaction' ? (
                      <div className="text-2xl animate-bounce">
                        {msg.message}
                      </div>
                    ) : (
                      <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.author === 'You'
                          ? 'bg-primary-500 text-white'
                          : msg.author === 'System'
                          ? 'bg-gray-100 text-gray-600 italic'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.author === 'You' ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-primary-500 text-white px-3 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Browse Mode */
          <div>
            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search YouTube, Netflix, or paste a video URL..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Video
              </button>
            </div>

            {/* Recommendations */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended for You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((video) => (
                  <motion.div
                    key={video.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          onClick={() => handleStartWatching(video.id)}
                          className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
                        >
                          <Play className="h-6 w-6 text-white ml-1" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-white text-xs">
                        {video.duration}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2">{video.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {video.genre}
                        </span>
                        <button
                          onClick={() => handleStartWatching(video.id)}
                          className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Watch Together
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Platform Integration Info */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Search className="h-8 w-8 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Find Content</h4>
                  <p className="text-gray-600 text-sm">Search or paste links from YouTube, Netflix, or other platforms</p>
                </div>
                <div>
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Sync Together</h4>
                  <p className="text-gray-600 text-sm">Both partners see the same content at the same time</p>
                </div>
                <div>
                  <div className="bg-pink-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-pink-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Chat & React</h4>
                  <p className="text-gray-600 text-sm">Share reactions and chat in real-time while watching</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Watch Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Quality
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Auto</option>
                    <option>1080p</option>
                    <option>720p</option>
                    <option>480p</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sync Mode
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Automatic Sync</option>
                    <option>Manual Sync</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="notifications" className="mr-2" defaultChecked />
                  <label htmlFor="notifications" className="text-sm text-gray-700">
                    Enable chat notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="reactions" className="mr-2" defaultChecked />
                  <label htmlFor="reactions" className="text-sm text-gray-700">
                    Show floating reactions
                  </label>
                </div>
              </div>
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-primary-500 text-white py-3 px-4 rounded-xl hover:bg-primary-600 transition-colors font-semibold"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WatchTogetherPage;