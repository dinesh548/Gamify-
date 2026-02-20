const express = require('express');
const { auth } = require('../middleware/auth');
const Game = require('../models/Game');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const gameEngine = require('../../game-engine/index');

const router = express.Router();

const DATA_DIR = path.join(__dirname, '../data');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');

// Load games from JSON templates
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
  } catch (error) {
    console.error('Error loading game templates:', error);
    return [];
  }
};

// Get all games
router.get('/', auth, async (req, res) => {
  try {
    let games;
    try {
      games = await Game.find({ isActive: true });
    } catch {
      // MongoDB not available, load from JSON templates
      games = await loadGameTemplates();
    }

    // If no games in DB, load from templates
    if (!games || games.length === 0) {
      games = await loadGameTemplates();
    }

    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games', error: error.message });
  }
});

// Get single game by ID
router.get('/:gameId', auth, async (req, res) => {
  try {
    const { gameId } = req.params;
    let game;
    
    try {
      game = await Game.findOne({ gameId, isActive: true });
    } catch {
      const games = await loadGameTemplates();
      game = games.find(g => g.gameId === gameId);
    }

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game', error: error.message });
  }
});

// Submit game result
router.post('/:gameId/submit', auth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.userId;

    // Load game
    let game;
    try {
      game = await Game.findOne({ gameId });
    } catch {
      const games = await loadGameTemplates();
      game = games.find(g => g.gameId === gameId);
    }

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Process game using engine
    const gameData = game.gameData || game;
    const result = gameEngine.processGameResult(gameData, answers, timeSpent);

    // Update user stats
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

    // Update XP and level
    const xpGained = result.xpEarned || game.xpReward || 10;
    user.xp = (user.xp || 0) + xpGained;
    user.calculateLevel();

    // Update skills
    const skillsTagged = game.skillsTagged || gameData.skillsTagged || [];
    skillsTagged.forEach(skill => {
      if (!user.skills[skill]) {
        user.skills[skill] = { level: 0, xp: 0, accuracy: 0, attempts: 0 };
      }
      user.skills[skill].xp += xpGained;
      user.skills[skill].attempts += 1;
      user.skills[skill].accuracy = ((user.skills[skill].accuracy || 0) * (user.skills[skill].attempts - 1) + result.accuracy) / user.skills[skill].attempts;
    });

    // Add game history
    const gameHistoryEntry = {
      gameId,
      gameType: game.type || gameData.type,
      score: result.score,
      accuracy: result.accuracy,
      timeSpent,
      difficulty: game.difficulty || gameData.difficulty,
      completedAt: new Date(),
      skillsTagged
    };

    user.gameHistory = user.gameHistory || [];
    user.gameHistory.push(gameHistoryEntry);

    // Update streak
    const today = new Date().toDateString();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null;
    if (lastActive === today) {
      // Already active today
    } else if (lastActive === new Date(Date.now() - 86400000).toDateString()) {
      // Active yesterday, continue streak
      user.streak = (user.streak || 0) + 1;
    } else {
      // Streak broken
      user.streak = 1;
    }
    user.lastActiveDate = new Date();

    // Calculate employability score
    user.calculateEmployabilityScore();

    // Save user
    try {
      await user.save();
    } catch {
      // Save to JSON
      const users = await getUsersFromJSON();
      const userIndex = users.findIndex(u => (u._id || u.id) === userId);
      if (userIndex !== -1) {
        users[userIndex] = user;
        await saveUsersToJSON(users);
      }
    }

    res.json({
      ...result,
      userStats: {
        xp: user.xp,
        level: user.level,
        employabilityScore: user.employabilityScore
      }
    });
  } catch (error) {
    console.error('Submit game error:', error);
    res.status(500).json({ message: 'Error processing game result', error: error.message });
  }
});

// Helper functions for JSON fallback
const getUsersFromJSON = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveUsersToJSON = async (users) => {
  await fs.writeFile(path.join(__dirname, '../data/users.json'), JSON.stringify(users, null, 2));
};

module.exports = router;
