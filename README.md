# PairPlay - Romantic App for Long-Distance Couples

A full-stack romantic platform designed for long-distance couples to stay connected through interactive games, shared experiences, and meaningful moments.

## 🚀 Features

### 🔐 Authentication & Connection
- JWT-based secure authentication
- Unique couple codes for partner connection
- Real-time online status tracking

### 🎮 Interactive Games
- Multiplayer games (UNO, Memory Match, Drawing, Trivia)
- Real-time gameplay with Socket.io
- Game statistics and history

### 📖 Shared Journal
- Create and share memories together
- Photo uploads and mood tracking
- Comments and reactions system

### ❓ Couple Quizzes
- AI-generated personality quizzes
- Custom quiz creation
- Score tracking and comparisons

### 🎁 Virtual Gifts
- Send surprise virtual gifts
- Scheduled delivery options
- Gift reactions and responses

### 📺 Watch Together
- Synchronized video watching
- Real-time chat during movies
- Watch history and playlists

### 🤖 AI Love Letter Generator
- Generate romantic letters with different tones
- OpenAI-powered personalization
- Save and send letters

### 📊 Activity Tracking
- Real-time activity feed
- Relationship statistics
- Milestone tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.io Client** for real-time features
- **Axios** for API calls
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.io** for real-time communication
- **JWT** for authentication
- **OpenAI API** for AI features
- **bcryptjs** for password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pairplay-romantic-platform
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
```

4. **Set up environment variables**

Frontend (.env):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Backend (backend/.env):
```env
MONGODB_URI=mongodb://localhost:27017/pairplay
JWT_SECRET=your_super_secret_jwt_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
```

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

6. **Start the backend server**
```bash
cd backend
npm run dev
```

7. **Start the frontend development server**
```bash
# In the root directory
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Socket.io: http://localhost:5000

## 📁 Project Structure

```
pairplay-romantic-platform/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   ├── contexts/               # React contexts
│   ├── pages/                  # Page components
│   ├── utils/                  # Utility functions
│   └── main.tsx               # App entry point
├── backend/                    # Backend source code
│   ├── controllers/           # Route controllers
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── utils/                # Backend utilities
│   └── server.js             # Server entry point
├── public/                    # Static assets
└── package.json              # Frontend dependencies
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Couple Management
- `POST /api/couple/connect` - Connect with partner
- `GET /api/couple/info` - Get couple information
- `POST /api/couple/milestone` - Add milestone

### Games
- `POST /api/games/create` - Create game session
- `POST /api/games/:id/join` - Join game
- `POST /api/games/:id/move` - Make game move

### Journal
- `POST /api/journal/new` - Create journal entry
- `GET /api/journal` - Get journal entries
- `POST /api/journal/:id/react` - Add reaction

### Quizzes
- `POST /api/quiz/custom` - Create custom quiz
- `POST /api/ai/quiz` - Generate AI quiz
- `POST /api/quiz/:id/submit` - Submit quiz answers

### Gifts
- `POST /api/gift/send` - Send virtual gift
- `GET /api/gift` - Get gifts
- `POST /api/gift/:id/open` - Open gift

### AI Features
- `POST /api/ai/love-letter` - Generate love letter

## 🔌 Socket.io Events

### Connection
- `join` - Join with user ID
- `partner_status` - Partner online/offline status

### Games
- `invite_game` - Invite partner to game
- `join_game` - Join game session
- `game_move` - Make game move

### Watch Together
- `video_sync` - Sync video playback
- `chat_message` - Send chat message

### Real-time Updates
- `new_activity` - New activity notification
- `gift_received` - Gift received notification

## 🎨 Design Features

- **Responsive Design** - Works on all devices
- **Dark/Light Theme** - User preference support
- **Smooth Animations** - Framer Motion powered
- **Real-time Updates** - Socket.io integration
- **Modern UI** - Tailwind CSS styling

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet.js security headers

## 📱 Mobile Support

The app is fully responsive and works great on:
- Desktop browsers
- Mobile browsers
- Tablet devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

## 🎯 Future Features

- [ ] Video calling integration
- [ ] Photo sharing and albums
- [ ] Calendar and event planning
- [ ] Voice messages
- [ ] Location sharing
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced AI features

---

Made with ❤️ for couples everywhere 💕