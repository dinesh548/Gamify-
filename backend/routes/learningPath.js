const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Game = require('../models/Game');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const getUsersFromJSON = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const loadGameTemplates = async () => {
  const templatesDir = path.join(__dirname, '../../game-templates');
  try {
    const files = await fs.readdir(templatesDir);
    const games = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(templatesDir, file), 'utf8');
        const gameData = JSON.parse(content);
        games.push(gameData);
      }
    }
    return games;
  } catch {
    return [];
  }
};

// Get personalized learning path
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    let user;
    
    try {
      user = await User.findById(userId);
    } catch {
      const users = await getUsersFromJSON();
      user = users.find(u => (u._id || u.id) === userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Load all games
    let allGames;
    try {
      allGames = await Game.find({ isActive: true });
    } catch {
      allGames = await loadGameTemplates();
    }

    if (!allGames || allGames.length === 0) {
      allGames = await loadGameTemplates();
    }

    // Skill gap analysis
    const skillGaps = analyzeSkillGaps(user);
    
    // Recommend next games based on skill gaps
    const recommendations = recommendGames(user, allGames, skillGaps);

    // Generate learning path
    const learningPath = generateLearningPath(user, recommendations, skillGaps);

    res.json({
      skillGaps,
      recommendations,
      learningPath,
      currentLevel: user.level,
      targetLevel: user.level + 2,
      estimatedWeeks: Math.ceil(recommendations.length / 5) // Assuming 5 games per week
    });
  } catch (error) {
    console.error('Learning path error:', error);
    res.status(500).json({ message: 'Error generating learning path', error: error.message });
  }
});

function analyzeSkillGaps(user) {
  const skills = user.skills || {};
  const gaps = [];

  // Target proficiency: 70% accuracy with at least 10 attempts
  Object.keys(skills).forEach(skill => {
    const skillData = skills[skill];
    const accuracy = skillData.accuracy || 0;
    const attempts = skillData.attempts || 0;
    
    if (accuracy < 70 || attempts < 10) {
      gaps.push({
        skill,
        currentAccuracy: accuracy,
        currentAttempts: attempts,
        gap: Math.max(70 - accuracy, 0) + (attempts < 10 ? 10 - attempts : 0),
        priority: calculatePriority(skill, accuracy, attempts)
      });
    }
  });

  return gaps.sort((a, b) => b.priority - a.priority);
}

function calculatePriority(skill, accuracy, attempts) {
  // Higher priority for lower accuracy and fewer attempts
  const accuracyWeight = (100 - accuracy) * 0.6;
  const attemptsWeight = Math.max(0, 10 - attempts) * 4;
  return accuracyWeight + attemptsWeight;
}

function recommendGames(user, allGames, skillGaps) {
  const playedGameIds = new Set((user.gameHistory || []).map(g => g.gameId));
  const recommendations = [];

  // Prioritize games that address skill gaps
  skillGaps.forEach(gap => {
    const relevantGames = allGames
      .filter(game => {
        const gameData = game.gameData || game;
        const skillsTagged = game.skillsTagged || gameData.skillsTagged || [];
        return skillsTagged.includes(gap.skill) && !playedGameIds.has(game.gameId || gameData.gameId);
      })
      .map(game => {
        const gameData = game.gameData || game;
        const difficulty = game.difficulty || gameData.difficulty || 'beginner';
        return {
          ...gameData,
          gameId: game.gameId || gameData.gameId,
          relevanceScore: calculateRelevanceScore(user, gameData, gap)
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);

    recommendations.push(...relevantGames);
  });

  // Add some variety - games for skills that are already strong
  const strongSkills = Object.keys(user.skills || {}).filter(skill => {
    const skillData = user.skills[skill];
    return (skillData.accuracy || 0) >= 70 && (skillData.attempts || 0) >= 10;
  });

  strongSkills.forEach(skill => {
    const advancedGames = allGames
      .filter(game => {
        const gameData = game.gameData || game;
        const skillsTagged = game.skillsTagged || gameData.skillsTagged || [];
        const difficulty = game.difficulty || gameData.difficulty || 'beginner';
        return skillsTagged.includes(skill) && 
               difficulty === 'advanced' && 
               !playedGameIds.has(game.gameId || gameData.gameId);
      })
      .slice(0, 2);

    recommendations.push(...advancedGames.map(game => ({
      ...(game.gameData || game),
      gameId: game.gameId || (game.gameData || game).gameId,
      relevanceScore: 50
    })));
  });

  // Remove duplicates and sort
  const uniqueRecommendations = Array.from(
    new Map(recommendations.map(g => [g.gameId, g])).values()
  ).sort((a, b) => b.relevanceScore - a.relevanceScore);

  return uniqueRecommendations.slice(0, 10);
}

function calculateRelevanceScore(user, game, skillGap) {
  let score = 100;
  
  // Reduce score if difficulty doesn't match user level
  const userLevel = user.level || 1;
  const difficulty = game.difficulty || 'beginner';
  if (difficulty === 'advanced' && userLevel < 5) score -= 30;
  if (difficulty === 'beginner' && userLevel > 10) score -= 20;

  // Increase score if it addresses a critical skill gap
  const skillsTagged = game.skillsTagged || [];
  if (skillsTagged.includes(skillGap.skill)) {
    score += skillGap.priority;
  }

  return score;
}

function generateLearningPath(user, recommendations, skillGaps) {
  const path = [];
  const weeks = Math.ceil(recommendations.length / 5);

  for (let week = 1; week <= weeks; week++) {
    const weekGames = recommendations.slice((week - 1) * 5, week * 5);
    path.push({
      week,
      focus: skillGaps[week - 1]?.skill || 'General Practice',
      games: weekGames.map(g => ({
        gameId: g.gameId,
        title: g.title,
        type: g.type,
        difficulty: g.difficulty
      })),
      goals: [
        `Complete ${weekGames.length} games`,
        `Improve ${skillGaps[week - 1]?.skill || 'overall'} skills`,
        `Maintain daily streak`
      ]
    });
  }

  return path;
}

module.exports = router;
