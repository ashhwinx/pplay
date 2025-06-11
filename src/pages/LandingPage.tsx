import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Play, Users, BookHeart, Gift, Gamepad2, ArrowRight, Star } from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Gamepad2,
      title: 'Multiplayer Games',
      description: 'Play UNO, Memory Match, and drawing games together in real-time'
    },
    {
      icon: Users,
      title: 'Couple Quizzes',
      description: 'Test how well you know each other with personalized quizzes'
    },
    {
      icon: BookHeart,
      title: 'Shared Journal',
      description: 'Create memories together with photos, notes, and special moments'
    },
    {
      icon: Play,
      title: 'Watch Together',
      description: 'Sync movies and shows while chatting and reacting together'
    },
    {
      icon: Gift,
      title: 'Virtual Gifts',
      description: 'Send surprise messages, voice notes, and animated gifts'
    },
    {
      icon: Heart,
      title: 'AI Love Letters',
      description: 'Generate romantic messages with different moods and styles'
    }
  ];

  const testimonials = [
    {
      name: 'Emily & Jake',
      text: 'PairPlay has been a game-changer for our long-distance relationship. We play games every night!',
      rating: 5
    },
    {
      name: 'Maria & Carlos',
      text: 'The shared journal feature helps us feel connected despite being 3,000 miles apart.',
      rating: 5
    },
    {
      name: 'Lisa & Tom',
      text: 'Movie nights have never been better. We can finally watch together and chat in real-time!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-purple-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary-500 mr-2" />
              <span className="font-display font-bold text-xl text-gray-900">PairPlay</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-6xl font-display font-bold text-gray-900 mb-6">
                Play. Talk. Laugh.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">
                  Love.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                The ultimate platform for long-distance couples to stay connected through interactive games, 
                shared experiences, and meaningful moments — from anywhere in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center"
                >
                  Try PairPlay Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="border-2 border-primary-300 text-primary-700 px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors font-semibold text-lg">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="mt-16 lg:mt-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-500 rounded-3xl blur-3xl opacity-30 animate-pulse-slow" />
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                  alt="Couple playing together"
                  className="relative rounded-3xl shadow-2xl"
                />
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl animate-float">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl animate-bounce-slow">
                  <Gamepad2 className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              Everything You Need to Stay Connected
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From interactive games to shared memories, PairPlay brings couples together 
              with features designed for love that knows no distance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2"
              >
                <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              Loved by Couples Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See how PairPlay is bringing couples closer together
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-primary-600">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
            Ready to Strengthen Your Bond?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of couples who are already playing, laughing, and loving together on PairPlay.
          </p>
          <Link
            to="/signup"
            className="bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg inline-flex items-center"
          >
            Start Your Journey Together
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-8 w-8 text-primary-500 mr-2" />
              <span className="font-display font-bold text-xl">PairPlay</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2024 PairPlay. Made with ❤️ for couples everywhere.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;