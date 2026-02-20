# Game Engine Documentation

## Overview

The reusable JSON-based game engine is the core intelligence of the platform. It allows games to be defined entirely in JSON format, making it easy to add new games without code changes.

## Architecture

The game engine (`game-engine/index.js`) is a standalone module that:
- Loads games from JSON files
- Validates game structure
- Processes answers and calculates scores
- Generates feedback
- Calculates XP rewards

## Game Types

### 1. Quiz Games (`type: "quiz"`)

**Structure**:
```json
{
  "gameId": "unique-id",
  "title": "Game Title",
  "type": "quiz",
  "difficulty": "beginner|intermediate|advanced",
  "skillsTagged": ["DSA", "ML"],
  "xpReward": 15,
  "timeLimit": 600,
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice|true-false|text",
      "question": "Question text",
      "options": ["Option 1", "Option 2"],
      "correctAnswer": "Option 1",
      "points": 2,
      "explanation": "Why this is correct"
    }
  ]
}
```

**Question Types**:
- `multiple-choice`: Select from options
- `true-false`: Boolean answer
- `text`: Free text answer (simple matching)

### 2. Coding Challenges (`type: "coding"`)

**Structure**:
```json
{
  "gameId": "unique-id",
  "title": "Coding Challenge",
  "type": "coding",
  "difficulty": "intermediate",
  "skillsTagged": ["DSA"],
  "xpReward": 25,
  "timeLimit": 1800,
  "questions": [
    {
      "id": "c1",
      "description": "Problem description",
      "points": 10,
      "testCases": [
        {
          "input": "nums = [2,7,11,15], target = 9",
          "expectedOutput": "[0,1]"
        }
      ],
      "expectedPattern": "function",
      "hint": "Use a hash map"
    }
  ]
}
```

**Note**: Current implementation uses pattern matching. For production, integrate with a code execution service.

### 3. Simulation Games (`type: "simulation"`)

**Structure**:
```json
{
  "gameId": "unique-id",
  "title": "Scenario Simulation",
  "type": "simulation",
  "difficulty": "intermediate",
  "skillsTagged": ["DBMS"],
  "xpReward": 18,
  "timeLimit": 1200,
  "questions": [
    {
      "id": "s1",
      "description": "Scenario description",
      "options": ["Choice 1", "Choice 2"],
      "correctChoice": "Choice 1",
      "points": 5,
      "explanation": "Why this choice is correct"
    }
  ]
}
```

## Game Engine API

### `loadGame(gameData)`
Loads and validates a game from JSON.

**Parameters**:
- `gameData` (Object): Game JSON object

**Returns**: Validated game object

**Throws**: Error if game data is invalid

### `processGameResult(gameData, answers, timeSpent)`
Processes game submission and calculates results.

**Parameters**:
- `gameData` (Object): Game JSON object
- `answers` (Array): User's answers
- `timeSpent` (Number): Time taken in seconds

**Returns**:
```javascript
{
  score: 85,              // Percentage score
  accuracy: 85,          // Percentage accuracy
  correctAnswers: 4,     // Number of correct answers
  totalQuestions: 5,     // Total questions
  xpEarned: 12,          // XP points earned
  timeSpent: 120,        // Time taken
  results: [...],        // Detailed results per question
  feedback: "..."        // Feedback message
}
```

## Scoring Logic

### Quiz Games
- Each question has points (default: 1)
- Score = (total points earned / max points) * 100
- Accuracy = (correct answers / total questions) * 100

### Coding Challenges
- Each challenge has points (default: 5)
- Tests are evaluated (currently pattern-based)
- Score calculated similarly to quiz

### Simulation Games
- Each scenario has points (default: 3)
- Score based on correct choices

## XP Calculation

XP is calculated with multipliers:
- Base XP: `xpReward` from game JSON
- Accuracy multiplier: `accuracy / 100`
- Time bonus:
  - ≤50% of time limit: 1.2x
  - ≤80% of time limit: 1.0x
  - ≤100% of time limit: 0.9x
  - >100% of time limit: 0.7x

**Formula**: `XP = baseXP * accuracyMultiplier * timeBonus`

## Adding New Games

### Step 1: Create JSON File
Create a new JSON file in `/game-templates/` directory.

### Step 2: Follow Structure
Use one of the existing templates as a reference.

### Step 3: Deploy
- For MongoDB: Add game to database via admin panel or API
- For JSON fallback: Place file in `/game-templates/` directory

### Step 4: Test
Game will automatically appear in the games library.

## Extending Game Types

To add a new game type:

1. Add processor method to `GameEngine` class:
```javascript
processNewGameType(game, answers, timeSpent) {
  // Your processing logic
  return {
    score: ...,
    accuracy: ...,
    // ... other fields
  };
}
```

2. Register in constructor:
```javascript
this.gameTypes = {
  quiz: this.processQuizGame.bind(this),
  coding: this.processCodingGame.bind(this),
  simulation: this.processSimulationGame.bind(this),
  newType: this.processNewGameType.bind(this)  // Add this
};
```

3. Update game JSON to use `"type": "newType"`

## Best Practices

1. **Game IDs**: Use descriptive, unique IDs (e.g., `quiz-dsa-beginner-001`)
2. **Difficulty**: Be consistent with difficulty levels
3. **Skills Tagging**: Tag games with relevant skills for better recommendations
4. **XP Rewards**: Balance XP rewards based on difficulty and time
5. **Time Limits**: Set reasonable time limits based on game complexity
6. **Explanations**: Always include explanations for educational value

## Example Game

See `/game-templates/quiz-dsa-beginner.json` for a complete example.

## Testing

Test games locally:
1. Place JSON file in `/game-templates/`
2. Start backend server
3. Games will be automatically loaded
4. Test via frontend or API

## Integration

The game engine can be used independently:
```javascript
const gameEngine = require('./game-engine');

const gameData = { /* game JSON */ };
const answers = ['answer1', 'answer2'];
const timeSpent = 120;

const result = gameEngine.processGameResult(gameData, answers, timeSpent);
console.log(result);
```
