# Quick Start Guide

Get the Gamify Learning platform running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Installation

```bash
# Install all dependencies
npm run install:all
```

## Running Locally

### Option 1: Run Both Together (Recommended)
```bash
npm run dev
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## First Steps

1. **Open Frontend**: http://localhost:3000
2. **Register Account**: Click "Register" and create an account
3. **Explore Dashboard**: See your stats and featured games
4. **Play a Game**: Go to Games → Select a game → Play!
5. **View Analytics**: Check your progress and skill heatmap
6. **Check Leaderboard**: See how you rank

## Default Accounts

Create accounts with different roles:
- **Student**: Default role, full access to games
- **Admin**: Access to admin analytics
- **Recruiter**: Can view top performers
- **Mentor**: Similar to admin

## Sample Games

The platform comes with 5 sample games:
1. **DSA Basics Quiz** (Beginner)
2. **ML Fundamentals Quiz** (Intermediate)
3. **Two Sum Coding Challenge** (Intermediate)
4. **Database Design Simulation** (Intermediate)
5. **Aptitude Test** (Beginner)

## Features to Try

- ✅ Play games and earn XP
- ✅ Level up based on XP
- ✅ Track skill progress
- ✅ View personalized learning path
- ✅ Check leaderboard rankings
- ✅ See analytics dashboard
- ✅ Generate resume-ready skill summary

## Troubleshooting

**Backend won't start:**
- Check if port 5000 is available
- Verify Node.js version (18+)
- Check backend/.env file exists

**Frontend won't start:**
- Check if port 3000 is available
- Verify NEXT_PUBLIC_API_URL in .env.local
- Clear .next folder and rebuild

**Games not loading:**
- Check backend is running
- Verify game-templates folder exists
- Check backend logs for errors

**Database connection:**
- MongoDB is optional - JSON fallback works automatically
- If using MongoDB, check MONGODB_URI in backend/.env

## Next Steps

- Read [Architecture Documentation](./docs/ARCHITECTURE.md)
- Learn about [Game Engine](./docs/GAME_ENGINE.md)
- Check [API Documentation](./docs/API.md)
- See [Deployment Guide](./docs/DEPLOYMENT.md)

## Need Help?

- Check the documentation in `/docs` folder
- Review code comments
- Check console logs for errors

Happy Learning! 🎮📚
