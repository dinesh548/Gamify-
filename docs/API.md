# API Documentation

Base URL: `http://localhost:5000/api` (or your deployed backend URL)

All endpoints require authentication except `/auth/register` and `/auth/login`.

## Authentication

### Register
```
POST /auth/register
```

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"  // Optional: student|admin|mentor|recruiter
}
```

**Response**:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "student",
    "xp": 0,
    "level": 1
  }
}
```

### Login
```
POST /auth/login
```

**Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**: Same as register

### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer <token>
```

**Response**:
```json
{
  "_id": "user-id",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "student",
  "xp": 150,
  "level": 2,
  "badges": [],
  "streak": 5,
  "skills": { ... },
  "gameHistory": [ ... ],
  "employabilityScore": 65
}
```

## Games

### Get All Games
```
GET /games
Headers: Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "gameId": "quiz-dsa-beginner-001",
    "title": "DSA Basics",
    "type": "quiz",
    "difficulty": "beginner",
    "skillsTagged": ["DSA"],
    "xpReward": 15,
    "timeLimit": 600
  }
]
```

### Get Game by ID
```
GET /games/:gameId
Headers: Authorization: Bearer <token>
```

**Response**: Full game object with questions/scenarios

### Submit Game Result
```
POST /games/:gameId/submit
Headers: Authorization: Bearer <token>
```

**Body**:
```json
{
  "answers": ["answer1", "answer2", ...],
  "timeSpent": 120
}
```

**Response**:
```json
{
  "score": 85,
  "accuracy": 85,
  "correctAnswers": 4,
  "totalQuestions": 5,
  "xpEarned": 12,
  "timeSpent": 120,
  "results": [ ... ],
  "feedback": "Good job!",
  "userStats": {
    "xp": 162,
    "level": 2,
    "employabilityScore": 67
  }
}
```

## Analytics

### Get Student Analytics
```
GET /analytics/student
Headers: Authorization: Bearer <token>
```

**Response**:
```json
{
  "user": {
    "xp": 150,
    "level": 2,
    "badges": [],
    "streak": 5,
    "employabilityScore": 65
  },
  "skillHeatmap": [
    {
      "skill": "DSA",
      "level": 2,
      "xp": 50,
      "accuracy": 75,
      "attempts": 5
    }
  ],
  "scoreTrends": [
    {
      "date": "2026-02-20",
      "averageScore": 85
    }
  ],
  "totalGamesPlayed": 10,
  "recentGames": [ ... ]
}
```

### Get Admin Analytics
```
GET /analytics/admin
Headers: Authorization: Bearer <token>
Requires: admin role
```

**Response**:
```json
{
  "engagement": {
    "totalUsers": 100,
    "activeUsers": 45,
    "totalGamesPlayed": 500,
    "averageXP": 150,
    "averageEmployabilityScore": 65
  },
  "difficultyBalance": [
    {
      "difficulty": "beginner",
      "gamesPlayed": 200,
      "averageAccuracy": 75
    }
  ]
}
```

## Users

### Get User Profile
```
GET /users/profile
Headers: Authorization: Bearer <token>
```

**Response**:
```json
{
  "_id": "user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "xp": 150,
  "level": 2,
  "skills": { ... },
  "skillSummary": [
    {
      "skill": "DSA",
      "proficiency": 75,
      "accuracy": 75,
      "gamesCompleted": 5
    }
  ],
  "resumeReady": {
    "skills": "DSA (75%), ML (60%)",
    "employabilityScore": 65,
    "level": 2,
    "badges": "None"
  }
}
```

### Get Top Performers
```
GET /users/top-performers
Headers: Authorization: Bearer <token>
Requires: recruiter or admin role
```

**Response**:
```json
[
  {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "employabilityScore": 85,
    "level": 5,
    "badges": ["DSA Master"],
    "skills": [
      {
        "skill": "DSA",
        "proficiency": 90
      }
    ]
  }
]
```

## Leaderboard

### Get Leaderboard
```
GET /leaderboard?type=xp&limit=50
Headers: Authorization: Bearer <token>
```

**Query Parameters**:
- `type`: xp|level|employability|streak (default: xp)
- `limit`: Number of entries (default: 50)

**Response**:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "name": "John Doe",
      "xp": 500,
      "level": 5,
      "employabilityScore": 85,
      "streak": 10,
      "badges": 3
    }
  ],
  "userRank": 5,
  "type": "xp"
}
```

## Learning Path

### Get Personalized Learning Path
```
GET /learning-path
Headers: Authorization: Bearer <token>
```

**Response**:
```json
{
  "skillGaps": [
    {
      "skill": "ML",
      "currentAccuracy": 60,
      "currentAttempts": 3,
      "gap": 15,
      "priority": 25.5
    }
  ],
  "recommendations": [
    {
      "gameId": "quiz-ml-intermediate-001",
      "title": "ML Fundamentals",
      "type": "quiz",
      "difficulty": "intermediate",
      "relevanceScore": 95
    }
  ],
  "learningPath": [
    {
      "week": 1,
      "focus": "ML",
      "games": [ ... ],
      "goals": [
        "Complete 5 games",
        "Improve ML skills",
        "Maintain daily streak"
      ]
    }
  ],
  "currentLevel": 2,
  "targetLevel": 4,
  "estimatedWeeks": 3
}
```

## Error Responses

All endpoints may return error responses:

```json
{
  "message": "Error message",
  "error": "Detailed error"
}
```

**Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

## Authentication Header

Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

Currently no rate limiting implemented. For production, add rate limiting middleware.

## CORS

CORS is enabled for all origins. For production, configure allowed origins.
