# 🎓 SAKA (Smart Application for Kid's Speaking Activity)

![App Preview](https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200&h=300&fit=crop&auto=format)

**SAKA** is a comprehensive, production-ready English learning platform that combines Voice Recognition technology with interactive Gamification and Real-Time analytics. Students learn by speaking, while maintaining learning streaks, earning badges, and climbing the leaderboard. Administrators have full control over the content, user progress, and system analytics via a modern, elegant dashboard.

## ✨ Key Highlights
- 🎙️ **Voice-Powered Learning** - Practice English pronunciation with real-time Speech Recognition
- 🏆 **Gamification System** - Earn Daily Rewards, Badges, XP, and maintain Learning Streaks
- 📊 **Real-time Analytics** - Live Admin Dashboard and instant leaderboard updates via Socket.io
- 🎨 **Elegant UI/UX** - Clean, professional, and fully responsive "White & Blue" modern aesthetic
- ⚡ **Production Ready** - Protected by Rate Limiting, Helmet, Mongo Sanitize, and optimized for Vercel

## 🌟 Core Features

### 🧑‍🎓 For Students
- **Interactive Speaking Quizzes**: Answer questions using your voice with intelligent fuzzy text matching.
- **Progress Tracking**: Automatic level progression based on accuracy.
- **Daily Rewards & Streaks**: Claim daily rewards and build a continuous learning streak.
- **Dynamic Badges**: Unlock badges (First Blood, Speedster, Marathon) based on milestones.
- **Live Leaderboard**: Compete with peers for the top spot.
- **Profile Management**: View detailed learning statistics and customize account details.

### 👨‍💼 For Administrators
- **Dashboard Analytics**: Real-time KPIs, visual charts (Recharts), and performance metrics.
- **User Management**: Full CRUD operations, view individual student progress, and bulk import via Excel.
- **Content Control**: Manage learning levels, questions, and curriculum structure.
- **Data Export**: Export user data and leaderboards to CSV.
- **Platform Security**: Secured with JWT, express-rate-limit, and data sanitization.

## 🛠️ Technology Stack

### Backend
- **Node.js & Express.js** - Robust REST API framework
- **MongoDB & Mongoose** - NoSQL Database and Object Data Modeling
- **Socket.io** - WebSocket integration for real-time leaderboards
- **Security**: JWT (Authentication), bcryptjs (Hashing), express-rate-limit, Helmet, express-mongo-sanitize

### Frontend
- **React.js (Vite)** - Blazing fast UI framework
- **Tailwind CSS & Framer Motion** - Utility-first styling with smooth micro-animations
- **Web Speech API** - Built-in browser Text-to-Speech (TTS) and Speech-to-Text (STT)
- **string-similarity** - Intelligent fuzzy matching algorithm for voice answer validation
- **Recharts** - Beautiful and responsive data visualization
- **Lucide React** - Modern iconography

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Modern web browser with Web Speech API support (Google Chrome recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/FarrosIlman/saka-project.git
cd saka-project
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
# Database Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/saka_db
JWT_SECRET=your-super-secret-jwt-key
PORT=7000
NODE_ENV=development # Automatically disables rate-limiting for easier local testing
```

*Optional: Seed the database with initial data (Admin account & Sample levels)*
```bash
npm run seed
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```
The application will be running at `http://localhost:5173`.

---

## ☁️ Deployment Guide (Vercel)

This project is optimized for Serverless Deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Ensure you have two projects set up (if deploying backend and frontend separately) or use a monorepo setup.
3. **Environment Variables**: Make sure to add `MONGO_URI` and `JWT_SECRET` in your Vercel project settings.
4. The `backend/index.js` has been specifically configured with `app.set('trust proxy', 1);` and connection-wait middlewares to prevent timeouts and IP reading errors on Vercel's serverless functions.
5. Simply push your code to the `main` branch, and Vercel will automatically redeploy!

---

## 📄 API Documentation Overview
*(All endpoints prefixed with `/api`)*

- **Auth:** `/auth/register`, `/auth/login`, `/auth/logout`
- **Users:** `/users/profile`, `/admin/users` (CRUD)
- **Levels:** `/levels`, `/progress/complete-level`, `/quiz/check-answer`
- **Gamification:** `/gamification/claim-daily-reward`, `/gamification/badges`, `/gamification/streak`
- **Analytics:** `/analytics/dashboard`, `/analytics/leaderboard`

---

## 🔒 Security Best Practices Implemented
- **Rate Limiting**: Protects authentication routes from Brute-Force attacks.
- **NoSQL Injection Prevention**: Utilizes `express-mongo-sanitize`.
- **HTTP Header Security**: Utilizes `Helmet` to secure Express apps.
- **Role-Based Access Control (RBAC)**: Strict separation between `student` and `admin` routes.

## 📄 License
This project is proprietary and intended for portfolio/educational purposes.