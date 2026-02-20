const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
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

// Get student analytics
router.get('/student', auth, async (req, res) => {
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

    // Calculate skill heatmap data
    const skillHeatmap = Object.keys(user.skills || {}).map(skill => ({
      skill,
      level: user.skills[skill].level || 0,
      xp: user.skills[skill].xp || 0,
      accuracy: user.skills[skill].accuracy || 0,
      attempts: user.skills[skill].attempts || 0
    }));

    // Calculate score trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentGames = (user.gameHistory || []).filter(
      game => new Date(game.completedAt) >= sevenDaysAgo
    );

    const dailyScores = {};
    recentGames.forEach(game => {
      const date = new Date(game.completedAt).toDateString();
      if (!dailyScores[date]) {
        dailyScores[date] = { totalScore: 0, count: 0 };
      }
      dailyScores[date].totalScore += game.score || 0;
      dailyScores[date].count += 1;
    });

    const scoreTrends = Object.keys(dailyScores).map(date => ({
      date,
      averageScore: dailyScores[date].totalScore / dailyScores[date].count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      user: {
        xp: user.xp,
        level: user.level,
        badges: user.badges,
        streak: user.streak,
        employabilityScore: user.employabilityScore || 0
      },
      skillHeatmap,
      scoreTrends,
      totalGamesPlayed: user.gameHistory?.length || 0,
      recentGames: recentGames.slice(-5)
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Get admin analytics
router.get('/admin', auth, requireRole('admin'), async (req, res) => {
  try {
    let users;
    try {
      users = await User.find();
    } catch {
      users = await getUsersFromJSON();
    }

    // Engagement metrics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => {
      const lastActive = u.lastActiveDate ? new Date(u.lastActiveDate) : null;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return lastActive && lastActive >= sevenDaysAgo;
    }).length;

    const totalGamesPlayed = users.reduce((sum, u) => sum + (u.gameHistory?.length || 0), 0);
    const averageXP = users.reduce((sum, u) => sum + (u.xp || 0), 0) / totalUsers || 0;
    const averageEmployabilityScore = users.reduce((sum, u) => sum + (u.employabilityScore || 0), 0) / totalUsers || 0;

    // Difficulty balance analysis
    const difficultyStats = {};
    users.forEach(user => {
      (user.gameHistory || []).forEach(game => {
        const diff = game.difficulty || 'unknown';
        if (!difficultyStats[diff]) {
          difficultyStats[diff] = { count: 0, totalAccuracy: 0 };
        }
        difficultyStats[diff].count += 1;
        difficultyStats[diff].totalAccuracy += game.accuracy || 0;
      });
    });

    const difficultyBalance = Object.keys(difficultyStats).map(diff => ({
      difficulty: diff,
      gamesPlayed: difficultyStats[diff].count,
      averageAccuracy: difficultyStats[diff].totalAccuracy / difficultyStats[diff].count
    }));

    res.json({
      engagement: {
        totalUsers,
        activeUsers,
        totalGamesPlayed,
        averageXP: Math.round(averageXP),
        averageEmployabilityScore: Math.round(averageEmployabilityScore)
      },
      difficultyBalance
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Error fetching admin analytics', error: error.message });
  }
});

module.exports = router;
