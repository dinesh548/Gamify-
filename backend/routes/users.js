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

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    let user;
    
    try {
      user = await User.findById(userId).select('-password');
    } catch {
      const users = await getUsersFromJSON();
      user = users.find(u => (u._id || u.id) === userId);
      if (user) {
        delete user.password;
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate resume-ready skill summary
    const skillSummary = Object.keys(user.skills || {})
      .filter(skill => user.skills[skill].attempts > 0)
      .map(skill => ({
        skill,
        proficiency: calculateProficiency(user.skills[skill]),
        accuracy: Math.round(user.skills[skill].accuracy || 0),
        gamesCompleted: user.skills[skill].attempts || 0
      }))
      .sort((a, b) => b.proficiency - a.proficiency);

    res.json({
      ...user.toObject ? user.toObject() : user,
      skillSummary,
      resumeReady: {
        skills: skillSummary.map(s => `${s.skill} (${s.proficiency}%)`).join(', '),
        employabilityScore: user.employabilityScore || 0,
        level: user.level,
        badges: user.badges.join(', ') || 'None'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Get top performers (for recruiters)
router.get('/top-performers', auth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    let users;
    try {
      users = await User.find().sort({ employabilityScore: -1 }).limit(20);
    } catch {
      users = await getUsersFromJSON();
      users = users
        .sort((a, b) => (b.employabilityScore || 0) - (a.employabilityScore || 0))
        .slice(0, 20);
    }

    const topPerformers = users.map(user => ({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      employabilityScore: user.employabilityScore || 0,
      level: user.level || 1,
      badges: user.badges || [],
      skills: Object.keys(user.skills || {})
        .filter(skill => user.skills[skill].attempts > 0)
        .map(skill => ({
          skill,
          proficiency: calculateProficiency(user.skills[skill])
        }))
    }));

    res.json(topPerformers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top performers', error: error.message });
  }
});

function calculateProficiency(skillData) {
  if (!skillData || skillData.attempts === 0) return 0;
  const accuracyWeight = 0.6;
  const attemptsWeight = 0.4;
  const accuracyScore = (skillData.accuracy || 0) / 100;
  const attemptsScore = Math.min((skillData.attempts || 0) / 20, 1);
  return Math.round((accuracyScore * accuracyWeight + attemptsScore * attemptsWeight) * 100);
}

module.exports = router;
