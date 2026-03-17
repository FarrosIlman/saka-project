# 🎓 Professional English Learning Platform

![App Preview](https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200&h=300&fit=crop&auto=format)

A comprehensive, production-ready English learning platform that combines voice recognition technology with interactive gamification and real-time collaboration. Students learn through spoken questions and voice-based answers, while gaining achievements, maintaining learning streaks, and collaborating in community discussions. Administrators manage the entire platform through a sophisticated, real-time analytics dashboard.

## ✨ Key Highlights
- 🎙️ **Voice-Powered Learning** - Speak questions and answers naturally
- 🏆 **Gamification System** - Earn badges, streaks, and climb leaderboards
- 💬 **Community Forum** - Discuss levels and share insights with learners
- 📊 **Real-time Analytics** - Live dashboards and instant leaderboard updates
- 🔔 **Smart Notifications** - Get achievements and updates instantly
- 📱 **Mobile Responsive** - Learn on any device, anytime

## ✨ Features

### For Students
- 🎙️ **Voice-Powered Learning**: Questions are spoken aloud using Text-to-Speech
- 🎯 **Multiple Choice Questions**: Visual display with image support
- 🗣️ **Speech Recognition**: Answer questions using your voice with intelligent fuzzy matching
- 📈 **Progress Tracking**: Automatic level unlocking and score tracking
- 🎮 **Game-Like Experience**: 3-mistake rule per level for engaging challenge
- 🏆 **Badges & Achievements**: Unlock badges by reaching milestones (First Blood, Speedster, Perfectionist, Marathon, Champion, Legend)
- 🔥 **Streak Tracking**: Track daily practice streaks with best streak records
- ⭐ **Daily Rewards**: Claim daily rewards for consistent learning (10 points + 25 XP)
- 📊 **Leaderboard**: Real-time leaderboard showing top performers with live updates
- 💬 **Discussion Forum**: Comment on levels, rate quality (1-5 stars), reply to others, and mark helpful responses
- 🔔 **Smart Notifications**: Receive achievement unlocks, level completions, and learning reminders
- 📱 **Profile Dashboard**: View your progress, badges, streaks, and learning statistics

### For Administrators
- 📊 **Analytics Dashboard**: Real-time KPIs, performance metrics, and comprehensive statistics
- 👥 **User Management**: Full CRUD operations with search, pagination, and bulk actions
- 📝 **Content Management**: Complete control over levels, questions, difficulty settings, and image assets
- 📈 **Data Visualization**: Beautiful charts and graphs using Recharts library
- 🔐 **Secure Access**: Role-based authentication with JWT tokens
- 🏅 **Badge Management**: Create and manage achievement badges with custom unlock criteria
- 🔔 **Announcement System**: Send notifications and announcements to all users
- 📥 **Data Export**: Export user data, progress reports, and analytics to CSV/PDF
- 👀 **User Activity Monitoring**: Track user activity, login patterns, and engagement metrics
- 🎯 **Achievement Unlocking**: Grant achievements manually and manage unlock conditions

## 🚀 Clone this Project

## 📂 Project Structure

```
saka-project/
├── backend/                      # Node.js Express API Server
│   ├── config/                  # Database and configuration
│   ├── controllers/             # Business logic (16+ controllers)
│   ├── middleware/              # Auth and request middleware
│   ├── models/                  # MongoDB Mongoose schemas
│   ├── routes/                  # API endpoint definitions
│   ├── services/                # Socket.io real-time manager
│   ├── index.js                 # Server entry point
│   ├── seeder.js                # Database seeding
│   └── package.json             # Backend dependencies
│
├── frontend/                     # React + Vite Client App
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── admin/          # Admin dashboard components
│   │   │   ├── discussion/      # Comment system components
│   │   │   ├── gamification/    # Badge, streak, reward components
│   │   │   ├── realtime/        # Live leaderboard components
│   │   │   └── modals/          # Modal dialogs
│   │   ├── pages/               # Full page components
│   │   ├── services/            # API and Socket.io clients
│   │   ├── context/             # React context (Auth, Toast)
│   │   ├── utils/               # Helper functions
│   │   └── styles/              # Global styling
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite build configuration
│
└── README.md & Configuration Files
```

## 🎯 Core Modules

- **Authentication** - JWT-based login and role-based access
- **Quiz Engine** - Voice input processing with fuzzy matching
- **Progress Tracking** - Level unlocking and score management
- **Gamification** - Badges, streaks, achievements, points/XP
- **Real-time Features** - Socket.io for live leaderboard & notifications
- **Discussion Forums** - Level-specific comments with ratings
- **Analytics** - Comprehensive dashboard and user statistics
- **Admin Panel** - User management, content control, exports

## 🚀 Clone this Project

Want to create your own version of this project with all the content and structure? Clone this code repository to get started instantly:

\`\`\`bash
git clone https://github.com/FarrosIlman/saka-project.git
cd saka-project
\`\`\`

## 🛠️ Technologies Used

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database and ODM
- **Socket.io** - Real-time communication for leaderboard and notifications
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Multer** - File upload handling for images

### Frontend
- **React.js** (Vite) - UI framework with fast build times
- **React Router** - Client-side routing
- **Recharts** - Data visualization and charts
- **Socket.io Client** - Real-time updates for leaderboard
- **Web Speech API** - Text-to-Speech (TTS) and Speech-to-Text (STT)
- **string-similarity** - Fuzzy matching for voice answer validation
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **Tailwind CSS** - Utility-first CSS framework

## 📋 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Modern web browser with Web Speech API support (Chrome recommended)

### Installation

1. **Clone the repository** (after clicking the Clone button above)

2. **Set up the Backend**

```bash
cd backend
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the `backend` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/english-quiz-app
MONGO_DB_NAME=english-quiz-app

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Socket.io (for real-time features)
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

For MongoDB Atlas, use your connection string:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/english-quiz-app?retryWrites=true&w=majority
```

**Important**: Store sensitive values in `.env` file only - never commit to GitHub!

4. **Seed the Database**

```bash
# From the backend directory
node seeder.js
```

This creates:
- Admin user (username: `admin`, password: `admin123`)
- 5 levels with 5 questions each
- Sample progress data

5. **Start the Backend Server**

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

6. **Set up the Frontend**

```bash
cd ../frontend
npm install
```

7. **Configure Frontend Environment Variables** (Optional - for production)

Create a `.env.local` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

For production, create `.env.production`:
```env
VITE_API_URL=https://your-api-domain.com
VITE_SOCKET_URL=https://your-api-domain.com
```

8. **Start the Frontend Development Server**

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### ✅ Verification Checklist

After setup, verify everything is working:

- [ ] Backend: `http://localhost:5000/api/health` returns 200
- [ ] Frontend: `http://localhost:5173` loads without errors
- [ ] Login with admin credentials (`admin` / `admin123`)
- [ ] Voice features work in Chrome/Edge browsers
- [ ] Real-time leaderboard updates live
- [ ] Notifications appear in real-time
- [ ] Database seeding created sample data

### 🚨 Common Issues & Solutions

**Port already in use:**
```bash
# Find process using port 5000 (Windows)
netstat -ano | findstr :5000
# Kill process: taskkill /PID <PID> /F
```

**Dependencies cache issues:**
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

**MongoDB connection fails:**
```bash
# Test connection
mongo "mongodb://localhost:27017"
# For MongoDB Atlas, check IP whitelist
```

## 🎮 Usage Guide

### For Students

1. **Login**: Use your credentials or let admin create your account
2. **Dashboard**: View your progress, streaks, and available levels
3. **Take Quiz**:
   - Choose an unlocked level
   - Question is spoken aloud automatically via TTS
   - Click "Speak Your Answer 🎙️" and say your answer
   - System validates using fuzzy matching
   - Visual feedback shows correct (green) or incorrect (red)
   - Unlock next level by completing all 5 questions with fewer than 3 mistakes
4. **Earn Rewards**:
   - Complete levels to earn points and XP
   - Unlock achievements by reaching milestones
   - Maintain daily streaks for consistency tracking
   - Claim daily rewards (10 points + 25 XP)
5. **Compete & Discuss**:
   - View live leaderboard showing top performers
   - Join discussion forums on each level
   - Rate level quality and exchange tips with other learners
6. **Monitor Progress**:
   - Check your profile for detailed statistics
   - View achievement badges and progress
   - Track learning streaks and milestones

### For Administrators

1. **Login**: Use admin credentials (`admin` / `admin123` - change immediately!)
2. **Dashboard**: 
   - View real-time analytics and KPIs
   - Monitor user engagement and completion rates
   - Analyze performance trends
3. **User Management**: 
   - Create, edit, or delete users
   - Search and filter users by various criteria
   - View user profiles and activity
   - Award points or achievements manually
4. **Content Management**: 
   - Create and organize levels by difficulty
   - Add questions with images and multiple choice options
   - Configure voice question audio and recognition settings
5. **Gamification**:
   - Manage achievement badges and unlock criteria
   - Define badge rarities and requirements
   - Monitor badge distribution across users
6. **Notifications**:
   - Send announcements and updates to users
   - Configure notification types and priorities
7. **Analytics & Reporting**:
   - Export user data and progress reports
   - Analyze learning patterns
   - Generate performance summaries

## ⚡ Advanced Features

### Real-time Updates (Socket.io)
- **Live Leaderboard**: Watch rankings update in real-time as students complete levels
- **Real-time Notifications**: Get instant notifications for achievements, level completions, and announcements
- **Online Status**: See how many users are currently active on the platform
- **Instant Updates**: Leaderboard rankings refresh immediately when scores change

### Gamification System
- **10+ Achievement Badges**: First Blood, Speedster, Perfectionist, Marathon, Champion, Legend, and more
- **Progressive Badges**: Unlock requirements scale with difficulty (e.g., complete 1, 5, 10, 20 levels)
- **Badge Rarities**: Common, Rare, Epic, Legendary rarities with visual distinctions
- **Streak Tracking**: Current streak, best streak, and days until streak expires
- **Point System**: Earn base points from levels + bonus points for perfect scores
- **XP System**: Experience points for progression tracking

### Discussion & Collaboration
- **Level Comments**: Post questions and tips on specific levels
- **Star Ratings**: Rate level difficulty and quality (1-5 stars)
- **Helpful Voting**: Mark useful comments to help other learners
- **Nested Replies**: Have threaded conversations
- **Comment Management**: Edit/delete your own comments

### Admin Capabilities
- **Batch Operations**: Manage multiple users simultaneously
- **Advanced Search**: Filter users by status, level, activity date
- **Data Export**: CSV/PDF exports for reports and analysis
- **Automation**: Auto-unlock achievements based on criteria
- **Analytics Reports**: Detailed breakdowns of user engagement

### Responsive Design
- **Mobile-First**: Fully responsive design for all screen sizes
- **Touch-Friendly**: 48px+ minimum button sizes for mobile users
- **Adaptive Layouts**: Components adjust to different viewports
- **Performance**: Optimized for both desktop and mobile performance

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Endpoints (Protected)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/:userId` - Get specific user details
- `PUT /api/users/:userId/settings` - Update user settings (theme, language, notifications)

### Admin Endpoints (Protected - Admin Only)
- `GET /api/admin/dashboard-stats` - Dashboard analytics and KPIs
- `GET /api/admin/users` - List all users (with pagination and search)
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:userId` - Update user details
- `DELETE /api/admin/users/:userId` - Delete user with cascade
- `GET /api/admin/progress/:userId` - Get user progress details

### Level Management (Protected)
- `GET /api/levels` - Get all levels (with difficulty filters)
- `GET /api/levels/student` - Get available levels for current student
- `POST /api/levels` - Create new level (admin only)
- `PUT /api/levels/:levelId` - Update level details (admin only)
- `DELETE /api/levels/:levelId` - Delete level (admin only)
- `GET /api/levels/:levelNumber/questions/student` - Get questions for quiz

### Question Management (Protected)
- `POST /api/levels/:levelId/questions` - Add question to level (admin only)
- `PUT /api/questions/:questionId` - Update question (admin only)
- `DELETE /api/questions/:questionId` - Delete question (admin only)

### Quiz & Progress (Protected)
- `POST /api/quiz/check-answer` - Validate student answer with fuzzy matching
- `POST /api/progress/complete-level` - Mark level as complete and unlock next
- `GET /api/progress` - Get current user progress and unlocked levels

### Gamification (Protected)
- `GET /api/gamification/badges` - Get user badges and unlock progress
- `POST /api/gamification/check-badges/:userId` - Check and award eligible badges (admin)
- `GET /api/gamification/streak` - Get user streak information (current, longest, last activity)
- `POST /api/gamification/claim-daily-reward` - Claim daily reward (10 points + 25 XP)

### Analytics (Protected)
- `GET /api/analytics/user` - Get user analytics (stats, performance, progress)
- `GET /api/analytics/dashboard` - Get admin dashboard stats (admin only)
- `GET /api/analytics/leaderboard` - Get ranked users leaderboard
- `POST /api/analytics/award-points` - Award points to user (admin only)

### Notifications (Protected)
- `GET /api/notifications` - Get user notifications with pagination
- `GET /api/notifications/unread/count` - Get unread notification count
- `POST /api/notifications/create` - Create/send notification (admin only)
- `PUT /api/notifications/:notificationId/read` - Mark notification as read
- `DELETE /api/notifications/:notificationId` - Delete notification

### Comments & Discussion (Protected)
- `GET /api/comments/level/:levelId` - Get all comments for a level
- `POST /api/comments` - Create new comment on level
- `POST /api/comments/:commentId/reply` - Add reply to comment
- `PUT /api/comments/:commentId/helpful` - Mark comment as helpful (increment count)
- `DELETE /api/comments/:commentId` - Delete comment (owner/admin only)
- `PUT /api/comments/:commentId` - Update comment (owner/admin only)

### Export (Protected - Admin Only)
- `POST /api/export/users` - Export user list to CSV
- `POST /api/export/progress` - Export user progress to CSV
- `POST /api/export/analytics` - Export analytics data to PDF

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Create a MongoDB Atlas database
2. Set environment variables:
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - Strong secret key for JWT tokens
   - `PORT` - Server port (default: 5000)
   - `NODE_ENV` - Set to "production"
   - `CORS_ORIGIN` - Frontend URL for CORS
3. Enable WebSocket support for Socket.io real-time features
4. Deploy backend and note the deployed URL

### Frontend Deployment (Vercel/Netlify)

1. Update environment variables:
   - Create `.env.production` with `VITE_API_URL=your-backend-url`
2. Update `frontend/src/services/api.js` and `socketService.js` with production backend URL
3. Build the frontend: `npm run build`
4. Deploy the `dist` folder to Vercel/Netlify
5. Configure CORS in frontend to match backend domain

### Real-time Features Setup
- Ensure WebSocket connections are allowed on your hosting platform
- Socket.io requires persistent connections - avoid providers with aggressive connection timeouts
- Test real-time features (leaderboard updates, notifications) after deployment
- Monitor WebSocket connection health in production

## 🔐 Security Notes

- Change the default admin password immediately in production (`admin` / `admin123`)
- Use strong, unique JWT secrets (minimum 32 characters)
- Enable CORS only for trusted domains in production
- Use HTTPS for all production deployments
- Implement rate limiting on sensitive endpoints (login, upload)
- Sanitize all user inputs and validate file uploads
- Keep MongoDB credentials secure - use environment variables only
- Regularly update dependencies for security patches
- Enable HTTPS/WSS for WebSocket connections in production
- Implement request validation and SQL injection prevention

## 🐛 Troubleshooting

### Voice Recognition Not Working
- Check browser compatibility (Chrome recommended for full Web Speech API support)
- Ensure microphone permissions are granted
- Test microphone with system audio settings
- Check network connectivity for cloud-based TTS services

### Real-time Updates Not Showing
- Verify WebSocket connections are enabled on hosting platform
- Check browser console for Socket.io connection errors
- Ensure backend and frontend URLs match in Socket.io configuration
- Check firewall/proxy settings that might block WebSocket connections

### MongoDB Connection Issues
- Verify MongoDB Atlas IP whitelist includes your server IP
- Check connection string format and credentials
- Ensure MongoDB service is running for local development

## 📄 License

This project is provided as-is for educational purposes.

<!-- README_END -->