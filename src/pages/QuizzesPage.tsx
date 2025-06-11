import React, { useState } from 'react';
import { Users, Trophy, Plus, Play, Star, Clock, Brain, Zap, Heart } from 'lucide-react';
import Layout from '../components/Layout';
import { useCouple } from '../contexts/CoupleContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface QuizResult {
  question: string;
  yourAnswer: string;
  partnerAnswer: string;
  correct: boolean;
}

const QuizzesPage: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const { updateActivity, partner, isConnected } = useCouple();

  const quizzes = [
    {
      id: '1',
      title: 'How Well Do You Know Me?',
      description: 'Test your knowledge about your partner\'s preferences, dreams, and quirks',
      questions: 20,
      difficulty: 'Medium',
      bestScore: 85,
      lastPlayed: '2 days ago',
      category: 'Personal',
      color: 'bg-pink-500',
      type: 'ai-generated'
    },
    {
      id: '2',
      title: 'Our Relationship Timeline',
      description: 'Can you remember all the important dates and milestones in your relationship?',
      questions: 15,
      difficulty: 'Hard',
      bestScore: 73,
      lastPlayed: '1 week ago',
      category: 'Memory',
      color: 'bg-purple-500',
      type: 'ai-generated'
    },
    {
      id: '3',
      title: 'Favorite Things Challenge',
      description: 'Match your partner\'s favorite movies, foods, songs, and more',
      questions: 25,
      difficulty: 'Easy',
      bestScore: 92,
      lastPlayed: '3 days ago',
      category: 'Preferences',
      color: 'bg-rose-500',
      type: 'custom'
    },
    {
      id: '4',
      title: 'Future Dreams & Goals',
      description: 'How well do you know each other\'s aspirations and future plans?',
      questions: 18,
      difficulty: 'Medium',
      bestScore: null,
      lastPlayed: 'Never',
      category: 'Future',
      color: 'bg-violet-500',
      type: 'ai-generated'
    }
  ];

  const recentScores = [
    { quiz: 'How Well Do You Know Me?', yourScore: 85, partnerScore: 78, date: '2 days ago' },
    { quiz: 'Favorite Things Challenge', yourScore: 92, partnerScore: 88, date: '3 days ago' },
    { quiz: 'Our Relationship Timeline', yourScore: 73, partnerScore: 81, date: '1 week ago' }
  ];

  const sampleQuizResults: QuizResult[] = [
    {
      question: "What's my favorite color?",
      yourAnswer: "Blue",
      partnerAnswer: "Blue",
      correct: true
    },
    {
      question: "What's my biggest fear?",
      yourAnswer: "Heights",
      partnerAnswer: "Spiders",
      correct: false
    },
    {
      question: "What's my dream vacation destination?",
      yourAnswer: "Japan",
      partnerAnswer: "Japan",
      correct: true
    },
    {
      question: "What's my favorite food?",
      yourAnswer: "Pizza",
      partnerAnswer: "Sushi",
      correct: false
    },
    {
      question: "What's my favorite movie genre?",
      yourAnswer: "Romance",
      partnerAnswer: "Romance",
      correct: true
    }
  ];

  const handleStartQuiz = async (quizId: string) => {
    if (!isConnected) {
      toast.error('Please connect with your partner first!');
      return;
    }

    setSelectedQuiz(quizId);
    const quiz = quizzes.find(q => q.id === quizId);
    
    if (quiz) {
      // Simulate quiz taking
      setTimeout(() => {
        setQuizResults(sampleQuizResults);
        setShowResults(true);
        setSelectedQuiz(null);
        
        const correctAnswers = sampleQuizResults.filter(r => r.correct).length;
        const score = Math.round((correctAnswers / sampleQuizResults.length) * 100);
        
        updateActivity({
          type: 'quiz',
          description: `Completed "${quiz.title}" - You scored ${score}%`,
          icon: '🧠'
        });
        
        toast.success(`Quiz completed! You scored ${score}%`);
      }, 3000);
      
      updateActivity({
        type: 'quiz',
        description: `Started "${quiz.title}" quiz`,
        icon: '🧠'
      });
    }
  };

  const generateAIQuiz = async () => {
    toast.loading('Generating personalized quiz with AI...', { duration: 2000 });
    
    setTimeout(() => {
      toast.success('AI quiz generated! 🤖');
      // Add new AI-generated quiz to the list
    }, 2000);
  };

  // Chart data for results
  const correctAnswers = quizResults.filter(r => r.correct).length;
  const incorrectAnswers = quizResults.length - correctAnswers;
  
  const pieData = [
    { name: 'Correct', value: correctAnswers, color: '#10B981' },
    { name: 'Incorrect', value: incorrectAnswers, color: '#EF4444' }
  ];

  const barData = quizResults.map((result, index) => ({
    question: `Q${index + 1}`,
    correct: result.correct ? 1 : 0
  }));

  if (!isConnected) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect with Your Partner</h2>
            <p className="text-gray-600 mb-6">
              You need to connect with your partner before you can take quizzes together.
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
            <Users className="h-8 w-8 text-primary-500 mr-3" />
            Couple Quizzes
          </h1>
          <p className="text-gray-600">
            Test how well you know each other and learn something new
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Grid */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Available Quizzes</h2>
              <div className="flex space-x-3">
                <button
                  onClick={generateAIQuiz}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  AI Quiz
                </button>
                <button
                  onClick={() => setShowCreateQuiz(true)}
                  className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-purple-700 transition-all font-medium flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quiz
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <div className={`h-2 ${quiz.color}`} />
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {quiz.category}
                        </span>
                        {quiz.type === 'ai-generated' && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            AI
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Brain className="h-4 w-4 mr-1" />
                        {quiz.questions} questions
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {quiz.difficulty}
                      </div>
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-1" />
                        {quiz.bestScore ? `${quiz.bestScore}%` : 'Not played'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {quiz.lastPlayed}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleStartQuiz(quiz.id)}
                      className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold flex items-center justify-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quiz Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                Your Quiz Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quizzes Completed</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-semibold">82%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Score</span>
                  <span className="font-semibold text-green-600">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-semibold">58%</span>
                </div>
              </div>
            </div>

            {/* Recent Scores */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Scores</h3>
              <div className="space-y-4">
                {recentScores.map((score, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                    <p className="font-medium text-gray-900 text-sm mb-2">{score.quiz}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex space-x-4">
                        <span className={`font-medium ${score.yourScore > score.partnerScore ? 'text-green-600' : 'text-red-600'}`}>
                          You: {score.yourScore}%
                        </span>
                        <span className={`font-medium ${score.partnerScore > score.yourScore ? 'text-green-600' : 'text-red-600'}`}>
                          {partner?.name}: {score.partnerScore}%
                        </span>
                      </div>
                      <span className="text-gray-500">{score.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Quiz Tips</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Pay attention to small details in conversations</li>
                <li>• Remember special dates and moments</li>
                <li>• Ask follow-up questions to learn more</li>
                <li>• Create custom questions about recent events</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quiz Modal */}
        {selectedQuiz && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Taking Quiz...</h2>
              <p className="text-gray-600 mb-6">
                You and {partner?.name} are taking "{quizzes.find(q => q.id === selectedQuiz)?.title}"
              </p>
              <div className="flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}

        {/* Quiz Results Modal */}
        {showResults && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-8">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h2>
                <p className="text-gray-600">
                  You got {correctAnswers} out of {quizResults.length} questions correct!
                </p>
                <div className="text-4xl font-bold text-primary-600 mt-2">
                  {Math.round((correctAnswers / quizResults.length) * 100)}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Score Breakdown */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Score Breakdown</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Question by Question */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Question Performance</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="question" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="correct" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-bold text-gray-900">Detailed Results</h3>
                {quizResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 ${
                      result.correct 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{result.question}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.correct 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Your answer: </span>
                        <span className="font-medium">{result.yourAnswer}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">{partner?.name}'s answer: </span>
                        <span className="font-medium">{result.partnerAnswer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowResults(false)}
                className="w-full bg-primary-500 text-white py-3 px-4 rounded-xl hover:bg-primary-600 transition-colors font-semibold"
              >
                Close Results
              </button>
            </motion.div>
          </div>
        )}

        {/* Create Quiz Modal */}
        {showCreateQuiz && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Heart className="h-6 w-6 text-red-500 mr-2" />
                Create Custom Quiz
              </h2>
              <p className="text-gray-600 mb-6">
                Coming soon! You'll be able to create personalized quizzes with your own questions for your partner.
              </p>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Features coming soon:</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Create custom questions about your relationship</li>
                  <li>• Add multiple choice or open-ended questions</li>
                  <li>• Set difficulty levels and categories</li>
                  <li>• Schedule surprise quizzes for your partner</li>
                  <li>• Import questions from your shared memories</li>
                </ul>
              </div>
              <button
                onClick={() => setShowCreateQuiz(false)}
                className="w-full bg-primary-500 text-white py-3 px-4 rounded-xl hover:bg-primary-600 transition-colors font-semibold"
              >
                Got it!
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuizzesPage;