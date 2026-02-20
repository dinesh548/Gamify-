# Architecture Overview

## System Architecture

The Gamify Learning platform follows a modular, scalable architecture designed for hackathon deployment and future integration with existing training platforms.

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ Dashboard│  │  Games   │  │Analytics │  │Leaderboard││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST API
                          │
┌─────────────────────────────────────────────────────────┐
│              Backend API (Express.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   Auth   │  │  Games   │  │ Analytics│            │
│  └──────────┘  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Learning │  │  Users   │  │Leaderboard│            │
│  │   Path   │  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                     │
┌───────▼────────┐                  ┌───────▼────────┐
│   MongoDB      │                  │  JSON Fallback  │
│  (Production)  │                  │   (Development) │
└────────────────┘                  └─────────────────┘
        │
┌───────▼───────────────────────────────────────────────┐
│         Reusable Game Engine (Core Module)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │   Quiz   │  │  Coding  │  │Simulation│          │
│  └──────────┘  └──────────┘  └──────────┘          │
└───────────────────────────────────────────────────────┘
        │
┌───────▼───────────────────────────────────────────────┐
│         Game Templates (JSON Files)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ DSA Quiz │  │ ML Quiz  │  │ DBMS Sim │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└───────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (Next.js)
- **Framework**: Next.js 14 with React
- **Styling**: Tailwind CSS with dark theme
- **Charts**: Recharts for analytics visualization
- **State Management**: React hooks + Context API
- **Authentication**: JWT tokens stored in cookies

**Key Pages**:
- `/dashboard` - Main student dashboard
- `/games` - Game library and player
- `/analytics` - Performance analytics
- `/leaderboard` - Rankings
- `/learning-path` - Personalized recommendations
- `/top-performers` - Admin/Recruiter view

### 2. Backend (Express.js)
- **Framework**: Express.js
- **Database**: MongoDB with JSON fallback
- **Authentication**: JWT-based auth
- **API**: RESTful API design

**Key Routes**:
- `/api/auth` - Authentication (register, login, me)
- `/api/games` - Game management and submission
- `/api/analytics` - Student and admin analytics
- `/api/users` - User profiles and top performers
- `/api/leaderboard` - Rankings by various metrics
- `/api/learning-path` - Personalized learning recommendations

### 3. Game Engine (Reusable Module)
- **Location**: `/game-engine/index.js`
- **Purpose**: Process games dynamically from JSON
- **Types Supported**: Quiz, Coding, Simulation
- **Features**:
  - Dynamic game loading
  - Answer validation
  - Score calculation
  - XP calculation with time bonuses
  - Feedback generation

### 4. Game Templates (JSON)
- **Location**: `/game-templates/*.json`
- **Format**: Standardized JSON structure
- **Types**: Quiz, coding challenges, simulations
- **Extensible**: Add new games without code changes

## Data Flow

### Game Play Flow
1. User selects game from library
2. Frontend loads game JSON from backend
3. User answers questions/challenges
4. Frontend submits answers to backend
5. Backend processes via game engine
6. Backend updates user stats (XP, skills, history)
7. Backend returns results to frontend
8. Frontend displays results and updates dashboard

### Learning Path Generation
1. User requests learning path
2. Backend analyzes user's skill gaps
3. Backend loads all available games
4. Backend filters and ranks games by relevance
5. Backend generates weekly learning plan
6. Frontend displays personalized path

### Analytics Flow
1. User views analytics page
2. Frontend requests analytics data
3. Backend aggregates user performance data
4. Backend calculates trends and metrics
5. Frontend visualizes data with charts

## Intelligence Layer

### Adaptive Difficulty
- Tracks user accuracy and response time
- Adjusts recommended difficulty based on performance
- Implements rule-based logic (no ML APIs needed)

### Personalized Recommendations
- Skill gap analysis
- Relevance scoring algorithm
- Weekly learning path generation

### Employability Scoring
- Weighted skill proficiency calculation
- Badge and level bonuses
- Resume-ready skill summaries

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- API route protection middleware
- Input validation with express-validator

## Scalability Considerations

- Modular architecture allows easy scaling
- JSON fallback ensures functionality without database
- Stateless API design
- Game engine is independent and reusable
- Easy to add new game types

## Integration Points

The platform is designed to integrate with existing training company platforms:

1. **User Management**: Can sync with existing user database
2. **Game Library**: Can import games from external sources
3. **Analytics**: Can export data to existing analytics systems
4. **API**: RESTful API allows external integrations

## Technology Choices

- **Next.js**: Server-side rendering, fast development
- **Express.js**: Lightweight, flexible backend
- **MongoDB**: Scalable NoSQL database
- **JSON Fallback**: Ensures functionality without database setup
- **Tailwind CSS**: Rapid UI development
- **Recharts**: Free, lightweight charting library

## Future Enhancements

- Real-time multiplayer games
- Code execution sandbox for coding challenges
- AI-powered difficulty adjustment
- Social features (teams, competitions)
- Mobile app (React Native)
- Integration with external LMS platforms
