const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate love letter
const generateLoveLetter = async (req, res) => {
  try {
    const { tone, partnerName, customPrompt } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        message: 'OpenAI API key not configured',
        fallbackLetter: getFallbackLetter(tone, partnerName)
      });
    }

    const tonePrompts = {
      romantic: `Write a deeply romantic and heartfelt love letter. Use beautiful, poetic language that expresses deep love and longing. Include metaphors about stars, moonlight, and eternal love.`,
      funny: `Write a humorous and playful love letter. Include cute jokes, funny observations about the relationship, and light-hearted teasing. Keep it sweet but make them laugh.`,
      emotional: `Write an emotional and touching love letter. Express vulnerability, deep feelings, and gratitude. Talk about how they've changed your life and made you a better person.`,
      filmy: `Write a Bollywood-style dramatic love letter. Use over-the-top romantic expressions, references to classic Bollywood movies, and dramatic declarations of love. Include some Hindi words like "pyaar", "dil", "jaan".`
    };

    const prompt = customPrompt || `${tonePrompts[tone]} 
    
    The letter is for someone named ${partnerName || 'my love'}. 
    Make it personal, genuine, and about 150-200 words. 
    Don't use placeholder names or generic terms. 
    End with a loving signature.
    
    Write the letter in first person as if the user is writing to their partner.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a romantic letter writer who creates beautiful, personalized love letters for couples in long-distance relationships. Write with genuine emotion and avoid clichés."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const letter = completion.choices[0].message.content.trim();

    res.json({
      success: true,
      letter,
      tone,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('AI Love Letter error:', error);
    
    // Provide fallback letter if AI fails
    res.json({
      success: true,
      letter: getFallbackLetter(req.body.tone, req.body.partnerName),
      tone: req.body.tone,
      generatedAt: new Date(),
      fallback: true
    });
  }
};

// Generate quiz questions
const generateQuiz = async (req, res) => {
  try {
    const { category, difficulty, questionCount = 10 } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        message: 'OpenAI API key not configured',
        fallbackQuiz: getFallbackQuiz(category, difficulty)
      });
    }

    const categoryPrompts = {
      personal: "personal preferences, habits, dreams, fears, and personality traits",
      relationship: "relationship history, shared memories, important dates, and couple milestones",
      preferences: "favorite things like movies, food, music, colors, and hobbies",
      future: "future goals, dreams, travel plans, and life aspirations",
      fun: "random fun facts, silly preferences, and lighthearted topics"
    };

    const prompt = `Create ${questionCount} ${difficulty} quiz questions about ${categoryPrompts[category]} for couples to test how well they know each other.

    Format each question as a JSON object with:
    - question: the question text
    - type: "multiple-choice" 
    - options: array of 4 possible answers
    - correctAnswer: the correct answer (should be one of the options)
    - points: difficulty-based points (easy: 1, medium: 2, hard: 3)

    Make questions personal and relationship-focused. Avoid generic questions.
    Return only a valid JSON array of question objects.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a relationship quiz generator. Create thoughtful, personal questions that help couples learn about each other. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    let questions;
    try {
      questions = JSON.parse(completion.choices[0].message.content.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      questions = getFallbackQuiz(category, difficulty).questions;
    }

    res.json({
      success: true,
      quiz: {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Quiz`,
        description: `Test how well you know each other with these ${difficulty} questions about ${category}.`,
        category,
        difficulty,
        questions,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('AI Quiz generation error:', error);
    
    res.json({
      success: true,
      quiz: getFallbackQuiz(req.body.category, req.body.difficulty),
      fallback: true
    });
  }
};

// Fallback love letters when AI is not available
const getFallbackLetter = (tone, partnerName) => {
  const name = partnerName || 'my love';
  
  const letters = {
    romantic: `My dearest ${name},

Every moment without you feels like an eternity. Your smile lights up my darkest days, and your laugh is the melody that plays in my heart. I count the seconds until I can hold you again and tell you how much you mean to me.

You are my everything, my forever, my home. Distance means nothing when someone means everything.

With all my love,
Your devoted partner 💕`,

    funny: `Hey gorgeous! 😄

I was just thinking about how you steal my hoodies and somehow look better in them than I do. It's honestly unfair! But I guess that's what happens when you're dating someone who's basically a real-life Disney princess (except you snore like a cute little dragon).

Miss you tons and can't wait to steal my hoodies back!

Love and laughter,
Your favorite person 🐉💕`,

    emotional: `My heart,

In this vast universe, somehow we found each other, and that feels like the most beautiful miracle. You've seen me at my worst and loved me anyway. You've celebrated my victories and held me through my defeats.

You are my safe harbor, my greatest adventure, and my deepest love. Thank you for being you.

Forever yours,
The luckiest person alive 💙`,

    filmy: `Mere pyaar! 🎬

Like Shah Rukh Khan spreading his arms in the mustard fields, my heart spreads wide with love for you! You are the Kajol to my Shah Rukh, the melody to my Bollywood song.

Distance is just a villain in our love story, and like all good Bollywood movies, love will triumph! Tum mere liye duniya ho!

Tumhara deewana,
Your Bollywood hero ✨💕`
  };

  return letters[tone] || letters.romantic;
};

// Fallback quiz when AI is not available
const getFallbackQuiz = (category, difficulty) => {
  const pointsMap = { easy: 1, medium: 2, hard: 3 };
  const points = pointsMap[difficulty] || 2;

  const quizzes = {
    personal: {
      title: "Personal Preferences Quiz",
      description: "How well do you know your partner's personal preferences?",
      category: "personal",
      difficulty,
      questions: [
        {
          question: "What's your partner's favorite color?",
          type: "multiple-choice",
          options: ["Blue", "Red", "Green", "Purple"],
          correctAnswer: "Blue",
          points
        },
        {
          question: "What's your partner's biggest fear?",
          type: "multiple-choice",
          options: ["Heights", "Spiders", "Public speaking", "Dark"],
          correctAnswer: "Heights",
          points
        },
        {
          question: "What's your partner's dream vacation destination?",
          type: "multiple-choice",
          options: ["Paris", "Tokyo", "Bali", "New York"],
          correctAnswer: "Tokyo",
          points
        }
      ]
    },
    relationship: {
      title: "Relationship Timeline Quiz",
      description: "Test your knowledge about your relationship milestones.",
      category: "relationship",
      difficulty,
      questions: [
        {
          question: "Where did you have your first date?",
          type: "multiple-choice",
          options: ["Restaurant", "Park", "Cinema", "Coffee shop"],
          correctAnswer: "Coffee shop",
          points
        },
        {
          question: "What was the first movie you watched together?",
          type: "multiple-choice",
          options: ["The Notebook", "Avengers", "Titanic", "La La Land"],
          correctAnswer: "The Notebook",
          points
        }
      ]
    }
  };

  return quizzes[category] || quizzes.personal;
};

module.exports = {
  generateLoveLetter,
  generateQuiz
};