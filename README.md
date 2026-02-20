# 🎮 Gamify Learning, Amplify Employability

A gamified learning and employability web platform with a reusable JSON-based dynamic game engine for BTech CS, AIML, and DS students.

## 🚀 Features

- **Reusable JSON Game Engine**: Load games dynamically from JSON without code changes
- **Adaptive Difficulty Intelligence**: Auto-adjusts difficulty based on performance
- **Personalized Learning Paths**: AI-driven recommendations based on skill gaps
- **Real-Time Analytics Dashboard**: Track progress, skills, and performance
- **Gamification System**: XP, levels, badges, leaderboards, streaks
- **Employability Features**: Skill profiles, resume summaries, internship matching
- **Multiple User Roles**: Student, Admin, Mentor, Recruiter

## 📁 Project Structure

```
hackathon/
├── backend/              # Node.js + Express API
├── frontend/             # Next.js + Tailwind CSS
├── game-engine/          # Reusable JSON game engine core
├── game-templates/       # Sample JSON game templates
└── docs/                 # Documentation
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, MongoDB (with JSON fallback)
- **Authentication**: JWT
- **Game Engine**: Pure JavaScript (reusable module)

## 📦 Installation

```bash
# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB connection string (optional - uses JSON fallback if not provided)
```

## 🚀 Running Locally

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:3000
```

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set build command: `cd frontend && npm run build`
4. Set output directory: `frontend/.next`
5. Deploy!

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables (MONGODB_URI optional)

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Game Engine Guide](./docs/GAME_ENGINE.md)
- [API Documentation](./docs/API.md)

## 🎯 Core Concepts

### Game Engine
The reusable game engine loads games from JSON files. Each game defines:
- Metadata (title, description, type)
- Difficulty levels
- Questions/scenarios
- Scoring logic
- Skill tags

### Adaptive Intelligence
Tracks accuracy, response time, and attempts to automatically adjust difficulty and recommend next games.

### Learning Paths
Analyzes skill gaps and suggests personalized learning journeys based on employability goals.

## 📝 License

MIT
