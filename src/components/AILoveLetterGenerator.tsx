import React, { useState } from 'react';
import { Heart, Sparkles, Send, Save, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCouple } from '../contexts/CoupleContext';
import { aiAPI } from '../utils/api';

interface LoveLetter {
  id: string;
  content: string;
  tone: string;
  createdAt: Date;
  sent: boolean;
}

const AILoveLetterGenerator: React.FC = () => {
  const [selectedTone, setSelectedTone] = useState('romantic');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedLetters, setSavedLetters] = useState<LoveLetter[]>([]);
  const { updateActivity, partner } = useCouple();

  const tones = [
    {
      id: 'romantic',
      name: 'Romantic',
      emoji: '💕',
      description: 'Sweet and heartfelt',
      color: 'bg-pink-100 text-pink-700 border-pink-200'
    },
    {
      id: 'funny',
      name: 'Funny',
      emoji: '😄',
      description: 'Playful and humorous',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    {
      id: 'emotional',
      name: 'Emotional',
      emoji: '🥺',
      description: 'Deep and touching',
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      id: 'filmy',
      name: 'Filmy',
      emoji: '🎬',
      description: 'Bollywood style drama',
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    }
  ];

  const generateLetter = async () => {
    setIsGenerating(true);
    try {
      const response = await aiAPI.generateLoveLetter({
        tone: selectedTone,
        partnerName: partner?.name
      });
      
      setGeneratedLetter(response.data.letter);
      toast.success('Love letter generated! 💌');
    } catch (error) {
      console.error('Failed to generate letter:', error);
      toast.error('Failed to generate letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveLetter = () => {
    if (!generatedLetter) return;
    
    const newLetter: LoveLetter = {
      id: Math.random().toString(36).substr(2, 9),
      content: generatedLetter,
      tone: selectedTone,
      createdAt: new Date(),
      sent: false
    };
    
    setSavedLetters(prev => [newLetter, ...prev]);
    toast.success('Letter saved to Love Vault! 💝');
  };

  const sendLetter = () => {
    if (!generatedLetter || !partner) return;
    
    updateActivity({
      type: 'letter',
      description: `Sent an AI-generated ${selectedTone} love letter to ${partner.name}`,
      icon: '💌'
    });
    
    // Save as sent
    const newLetter: LoveLetter = {
      id: Math.random().toString(36).substr(2, 9),
      content: generatedLetter,
      tone: selectedTone,
      createdAt: new Date(),
      sent: true
    };
    
    setSavedLetters(prev => [newLetter, ...prev]);
    setGeneratedLetter('');
    
    toast.success(`Love letter sent to ${partner.name}! 💕`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Wand2 className="h-6 w-6 text-primary-500 mr-2" />
        AI Love Letter Generator
      </h2>

      {/* Tone Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Choose a tone:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                selectedTone === tone.id
                  ? tone.color + ' border-current'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{tone.emoji}</div>
              <div className="font-medium text-sm">{tone.name}</div>
              <div className="text-xs opacity-75">{tone.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center mb-6">
        <button
          onClick={generateLetter}
          disabled={isGenerating}
          className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Love Letter
            </>
          )}
        </button>
      </div>

      {/* Generated Letter */}
      {generatedLetter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 mb-6 border border-pink-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Your {tones.find(t => t.id === selectedTone)?.name} Love Letter
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={saveLetter}
                className="bg-white text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
              <button
                onClick={sendLetter}
                className="bg-primary-500 text-white px-3 py-1 rounded-lg hover:bg-primary-600 transition-colors text-sm flex items-center"
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </button>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed italic">"{generatedLetter}"</p>
        </motion.div>
      )}

      {/* Love Vault */}
      {savedLetters.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            Love Vault ({savedLetters.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {savedLetters.slice(0, 3).map((letter) => (
              <div
                key={letter.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {tones.find(t => t.id === letter.tone)?.name} Letter
                  </span>
                  <div className="flex items-center space-x-2">
                    {letter.sent && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Sent
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {letter.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {letter.content.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AILoveLetterGenerator;