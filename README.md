# 🎓 Professional English Learning Platform

![App Preview](https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200&h=300&fit=crop&auto=format)

A comprehensive, production-ready English learning platform that combines voice recognition technology with visual learning. Students learn through spoken questions and voice-based answers, while administrators manage the entire platform through a sophisticated dashboard.

## ✨ Features

### For Students
- 🎙️ **Voice-Powered Learning**: Questions are spoken aloud using Text-to-Speech
- 🎯 **Multiple Choice Questions**: Visual display with image support
- 🗣️ **Speech Recognition**: Answer questions using your voice with intelligent fuzzy matching
- 📈 **Progress Tracking**: Automatic level unlocking and score tracking
- 🎮 **Game-Like Experience**: 3-mistake rule per level for engaging challenge

### For Administrators
- 📊 **Analytics Dashboard**: Real-time KPIs and performance charts
- 👥 **User Management**: Full CRUD operations with search and pagination
- 📝 **Content Management**: Complete control over levels and questions
- 📈 **Data Visualization**: Beautiful charts using Recharts library
- 🔐 **Secure Access**: Role-based authentication with JWT tokens

## 🚀 Clone this Project

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this code repository to get started instantly

## 💬 Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built as a standalone MERN stack application with MongoDB

### Code Generation Prompt

> To generate the complete source code for a robust, multi-level English quiz application featuring a sophisticated hybrid input system: questions are spoken (TTS) and displayed visually (text + image + MCQ options), and users answer by speaking (STT). It includes full user management, progress tracking, and a professional admin dashboard. This is a full-stack, production-ready application. The backend (Node.js/Express/MongoDB) provides a comprehensive REST API for user, content, and progress management. The student-facing frontend (React.js) integrates Text-to-Speech for questions, displays image-based Multiple Choice Questions, and uses Speech-to-Text with fuzzy matching to process spoken answers. The admin dashboard is a feature-rich SPA for full platform control and analytics.

The app has been tailored to work with MongoDB and includes all the features requested above.

## 🛠️ Technologies Used

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database and ODM
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing

### Frontend
- **React.js** (Vite) - UI framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Web Speech API** - TTS and STT
- **string-similarity** - Fuzzy matching for voice answers
- **Axios** - HTTP client

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
MONGO_URI=mongodb://localhost:27017/english-quiz-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

For MongoDB Atlas, use your connection string:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/english-quiz-app?retryWrites=true&w=majority
```

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

7. **Start the Frontend Development Server**

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🎮 Usage Guide

### For Students

1. **Login**: Use any student credentials created by admin
2. **Select Level**: Choose an unlocked level from the level selection screen
3. **Take Quiz**:
   - Question is spoken aloud automatically
   - Click "Speak Your Answer 🎙️" and say your answer
   - Visual feedback shows if you're correct (green) or incorrect (red)
   - Complete all 5 questions with less than 3 mistakes to unlock next level

### For Administrators

1. **Login**: Use admin credentials (`admin` / `admin123`)
2. **Dashboard**: View analytics and platform statistics
3. **User Management**: Create, edit, or delete users
4. **Content Management**: Add, edit, or delete levels and questions

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - User login

### Admin Endpoints (Protected)
- `GET /api/admin/dashboard-stats` - Dashboard analytics
- `GET /api/admin/users` - List all users (with pagination)
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/progress/:userId` - Get user progress

### Level Management (Protected)
- `GET /api/levels` - Get all levels
- `POST /api/levels` - Create new level
- `PUT /api/levels/:levelId` - Update level
- `DELETE /api/levels/:levelId` - Delete level
- `POST /api/levels/:levelId/questions` - Add question to level
- `PUT /api/questions/:questionId` - Update question
- `DELETE /api/questions/:questionId` - Delete question

### Student Endpoints (Protected)
- `GET /api/levels/student` - Get available levels
- `GET /api/levels/:levelNumber/questions/student` - Get questions for level
- `POST /api/quiz/check-answer` - Validate answer
- `POST /api/progress/complete-level` - Complete level and unlock next
- `GET /api/progress` - Get current user progress

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Create a MongoDB Atlas database
2. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT`
3. Deploy backend and note the deployed URL

### Frontend Deployment (Vercel/Netlify)

1. Update `frontend/src/services/api.js` with production backend URL
2. Build the frontend: `npm run build`
3. Deploy the `dist` folder

## 🔐 Security Notes

- Change the default admin password immediately in production
- Use strong, unique JWT secrets
- Enable CORS only for trusted domains in production
- Use HTTPS for all production deployments
- Regularly update dependencies for security patches

## 📄 License

This project is provided as-is for educational purposes.

<!-- README_END -->