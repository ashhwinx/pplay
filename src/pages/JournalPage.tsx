import React, { useState } from 'react';
import { BookHeart, Plus, Camera, Heart, Calendar, Search, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { useCouple } from '../contexts/CoupleContext';
import { format } from 'date-fns';

const JournalPage: React.FC = () => {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'happy' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { updateActivity } = useCouple();

  const memories = [
    {
      id: '1',
      title: 'Our First Video Call',
      content: 'Today we had our first video call and talked for 3 hours straight! I can\'t believe how easy it is to talk to you. You make me laugh so much. ❤️',
      author: 'You',
      date: new Date('2024-12-15'),
      mood: 'excited',
      image: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=400&h=300&fit=crop',
      tags: ['milestone', 'first-time']
    },
    {
      id: '2',
      title: 'Missing You Tonight',
      content: 'It\'s been a long day and all I can think about is holding you. I miss your laugh, your smile, and the way you make everything better just by being there.',
      author: 'Sarah',
      date: new Date('2024-12-10'),
      mood: 'romantic',
      tags: ['missing-you', 'love']
    },
    {
      id: '3',
      title: 'Game Night Fun!',
      content: 'We played UNO for 2 hours tonight and you totally destroyed me! 😂 But it was so much fun. I love how competitive you get over card games.',
      author: 'You',
      date: new Date('2024-12-08'),
      mood: 'fun',
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop',
      tags: ['games', 'fun-times']
    },
    {
      id: '4',
      title: 'Surprise Love Letter',
      content: 'Thank you for the beautiful love letter you sent today. Reading your words made my heart skip a beat. I\'m so lucky to have someone who loves me the way you do.',
      author: 'Sarah',
      date: new Date('2024-12-05'),
      mood: 'grateful',
      tags: ['love-letter', 'grateful']
    }
  ];

  const moods = {
    happy: { emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
    excited: { emoji: '🤩', color: 'bg-orange-100 text-orange-800' },
    romantic: { emoji: '💕', color: 'bg-pink-100 text-pink-800' },
    fun: { emoji: '😄', color: 'bg-green-100 text-green-800' },
    grateful: { emoji: '🙏', color: 'bg-purple-100 text-purple-800' },
    missing: { emoji: '😔', color: 'bg-blue-100 text-blue-800' }
  };

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.content) {
      updateActivity({
        type: 'journal',
        description: `Added a new memory: "${newEntry.title}"`,
        icon: '📖'
      });
      setNewEntry({ title: '', content: '', mood: 'happy' });
      setShowAddEntry(false);
    }
  };

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'mine' && memory.author === 'You') ||
                         (selectedFilter === 'partner' && memory.author === 'Sarah') ||
                         memory.mood === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 flex items-center">
            <BookHeart className="h-8 w-8 text-primary-500 mr-3" />
            Our Love Journal
          </h1>
          <p className="text-gray-600">
            A shared space for your precious memories and thoughts
          </p>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Memories</option>
            <option value="mine">My Entries</option>
            <option value="partner">Sarah's Entries</option>
            <option value="romantic">Romantic</option>
            <option value="fun">Fun Times</option>
            <option value="grateful">Grateful</option>
          </select>

          <button
            onClick={() => setShowAddEntry(true)}
            className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Memory
          </button>
        </div>

        {/* Memory Timeline */}
        <div className="space-y-6">
          {filteredMemories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{memory.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(memory.date, 'MMM dd, yyyy')}
                      </span>
                      <span>by {memory.author}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${moods[memory.mood as keyof typeof moods]?.color}`}>
                    {moods[memory.mood as keyof typeof moods]?.emoji} {memory.mood}
                  </div>
                </div>

                {memory.image && (
                  <img
                    src={memory.image}
                    alt="Memory"
                    className="w-full h-64 object-cover rounded-xl mb-4"
                  />
                )}

                <p className="text-gray-700 leading-relaxed mb-4">{memory.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {memory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button className="text-red-500 hover:text-red-600 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Entry Modal */}
        {showAddEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Memory</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memory Title
                  </label>
                  <input
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="Give your memory a title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Thoughts
                  </label>
                  <textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    placeholder="Write about this special moment..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood
                  </label>
                  <select
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.entries(moods).map(([mood, { emoji }]) => (
                      <option key={mood} value={mood}>
                        {emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl py-8 text-gray-600 hover:bg-gray-50 transition-colors flex flex-col items-center">
                  <Camera className="h-8 w-8 mb-2" />
                  <span>Add Photo (Coming Soon)</span>
                </button>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEntry}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold"
                >
                  Save Memory
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JournalPage;