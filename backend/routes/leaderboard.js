const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
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

// Get leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const { type = 'xp', limit = 50 } = req.query;
    
    let users;
    try {
      users = await User.find().select('-password');
    } catch {
      users = await getUsersFromJSON();
      users.forEach(u => delete u.password);
    }

    // Sort by type
    let sortedUsers;
    switch (type) {
      case 'xp':
        sortedUsers = users.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        break;
      case 'level':
        sortedUsers = users.sort((a, b) => (b.level || 1) - (a.level || 1));
        break;
      case 'employability':
        sortedUsers = users.sort((a, b) => (b.employabilityScore || 0) - (a.employabilityScore || 0));
        break;
      case 'streak':
        sortedUsers = users.sort((a, b) => (b.streak || 0) - (a.streak || 0));
        break;
      default:
        sortedUsers = users.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    }

    const leaderboard = sortedUsers.slice(0, parseInt(limit)).map((user, index) => ({
      rank: index + 1,
      name: user.name,
      xp: user.xp || 0,
      level: user.level || 1,
      employabilityScore: user.employabilityScore || 0,
      streak: user.streak || 0,
      badges: user.badges?.length || 0
    }));

    // Find current user's rank
    const userId = req.user.userId;
    const userRank = sortedUsers.findIndex(u => (u._id || u.id) === userId) + 1;

    res.json({
      leaderboard,
      userRank: userRank > 0 ? userRank : null,
      type
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
});

module.exports = router;
