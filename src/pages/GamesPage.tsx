import React, { useState, useEffect } from 'react';
import { Gamepad2, Users, Clock, Trophy, Play, Star, Wifi } from 'lucide-react';
import Layout from '../components/Layout';
import { useCouple } from '../contexts/CoupleContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface GameSession {
  id: string;
  gameId: string;
  players: string[];
  status: 'waiting' | 'playing' | 'finished';
  winner?: string;
  scores?: { [playerId: string]: number };
}

const GamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { updateActivity, partner, isConnected: coupleConnected } = useCouple();

  const games = [
    {
      id: 'uno',
      title: 'Couple UNO',
      description: 'Classic UNO with romantic twists and couple challenges',
      players: '2 Players',
      duration: '15-30 min',
      difficulty: 'Easy',
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop',
      status: 'available'
    },
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Find matching pairs of your shared photos and memories',
      players: '2 Players',
      duration: '10-15 min',
      difficulty: 'Medium',
      image: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=300&h=200&fit=crop',
      status: 'available'
    },
    {
      id: 'drawing',
      title: 'Drawing Guessing',
      description: 'Draw and guess each other\'s creations in real-time',
      players: '2 Players',
      duration: '20-30 min',
      difficulty: 'Fun',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop',
      status: 'available'
    },
    {
      id: 'trivia',
      title: 'Couple Trivia',
      description: 'Test your knowledge about each other and your relationship',
      players: '2 Players',
      duration: '15-25 min',
      difficulty: 'Medium',
      image: 'https://images.unsplash.com/photo-1616628188540-6ece0241e1a0?w=300&h=200&fit=crop',
      status: 'available'
    }
  ];

  const recentGames = [
    { name: 'Memory Match', result: 'You Won!', date: '2 hours ago', score: '12-8' },
    { name: 'Couple UNO', result: 'Sarah Won', date: '1 day ago', score: '3-2' },
    { name: 'Drawing Guessing', result: 'Tie Game', date: '2 days ago', score: '5-5' }
  ];

  // Simulate real-time connection
  useEffect(() => {
    if (coupleConnected) {
      setIsConnected(true);
    }
  }, [coupleConnected]);

  const handlePlayGame = async (gameId: string) => {
    if (!coupleConnected) {
      toast.error('Please connect with your partner first!');
      return;
    }

    setSelectedGame(gameId);
    const game = games.find(g => g.id === gameId);
    
    if (game) {
      // Create game session
      const session: GameSession = {
        id: Math.random().toString(36).substr(2, 9),
        gameId,
        players: ['user1'],
        status: 'waiting'
      };
      
      setGameSession(session);
      
      // Simulate partner joining after 2 seconds
      setTimeout(() => {
        if (partner) {
          session.players.push(partner.id);
          session.status = 'playing';
          setGameSession({ ...session });
          toast.success(`${partner.name} joined the game!`);
          
          // Simulate game completion after 5 seconds
          setTimeout(() => {
            const winner = Math.random() > 0.5 ? 'user1' : partner.id;
            session.status = 'finished';
            session.winner = winner;
            session.scores = {
              'user1': Math.floor(Math.random() * 20) + 10,
              [partner.id]: Math.floor(Math.random() * 20) + 10
            };
            setGameSession({ ...session });
            
            const winnerName = winner === 'user1' ? 'You' : partner.name;
            toast.success(`Game finished! ${winnerName} won! 🎉`);
            
            updateActivity({
              type: 'game',
              description: `${winnerName} won ${game.title}!`,
              icon: '🎮'
            });
            
            // Close modal after 3 seconds
            setTimeout(() => {
              setSelectedGame(null);
              setGameSession(null);
            }, 3000);
          }, 5000);
        }
      }, 2000);
      
      updateActivity({
        type: 'game',
        description: `Started playing ${game.title}`,
        icon: '🎮'
      });
    }
  };

  if (!coupleConnected) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <div className="text-center py-16">
            <Gamepad2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect with Your Partner</h2>
            <p className="text-gray-600 mb-6">
              You need to connect with your partner before you can play games together.
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
            <Gamepad2 className="h-8 w-8 text-primary-500 mr-3" />
            Couple Games
          </h1>
          <p className="text-gray-600 flex items-center">
            <Wifi className="h-4 w-4 text-green-500 mr-2" />
            Play together, laugh together, and create memories together
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Games Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Wifi className="h-3 w-3 mr-1" />
                      Online
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{game.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {game.players}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {game.duration}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {game.difficulty}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handlePlayGame(game.id)}
                      className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold flex items-center justify-center"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Invite Partner
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                Your Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Games Played</span>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Games Won</span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-semibold text-green-600">49%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favorite Game</span>
                  <span className="font-semibold">Memory Match</span>
                </div>
              </div>
            </div>

            {/* Recent Games */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Games</h3>
              <div className="space-y-3">
                {recentGames.map((game, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{game.name}</p>
                        <p className="text-sm text-gray-500">{game.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          game.result.includes('You Won') ? 'text-green-600' : 
                          game.result.includes('Tie') ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {game.result}
                        </p>
                        <p className="text-xs text-gray-500">{game.score}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Game Session Modal */}
        {selectedGame && gameSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                {gameSession.status === 'waiting' && (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Inviting Partner...</h2>
                    <p className="text-gray-600 mb-6">
                      Waiting for {partner?.name} to join {games.find(g => g.id === selectedGame)?.title}
                    </p>
                  </>
                )}
                
                {gameSession.status === 'playing' && (
                  <>
                    <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Play className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Started!</h2>
                    <p className="text-gray-600 mb-6">
                      You and {partner?.name} are now playing {games.find(g => g.id === selectedGame)?.title}
                    </p>
                    <div className="animate-pulse bg-gradient-to-r from-primary-500 to-purple-600 text-white py-2 px-4 rounded-lg">
                      Playing...
                    </div>
                  </>
                )}
                
                {gameSession.status === 'finished' && (
                  <>
                    <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Finished!</h2>
                    <p className="text-gray-600 mb-4">
                      {gameSession.winner === 'user1' ? 'You won!' : `${partner?.name} won!`}
                    </p>
                    {gameSession.scores && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center">
                          <span>You: {gameSession.scores['user1']}</span>
                          <span>{partner?.name}: {gameSession.scores[partner?.id || '']}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <button
                  onClick={() => {
                    setSelectedGame(null);
                    setGameSession(null);
                  }}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  {gameSession.status === 'finished' ? 'Close' : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GamesPage;