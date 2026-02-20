const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'admin', 'mentor', 'recruiter'], 
    default: 'student' 
  },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  skills: {
    DSA: { level: Number, xp: Number, accuracy: Number, attempts: Number },
    ML: { level: Number, xp: Number, accuracy: Number, attempts: Number },
    DBMS: { level: Number, xp: Number, accuracy: Number, attempts: Number },
    Aptitude: { level: Number, xp: Number, accuracy: Number, attempts: Number },
    Frontend: { level: Number, xp: Number, accuracy: Number, attempts: Number },
    Backend: { level: Number, xp: Number, accuracy: Number, attempts: Number }
  },
  gameHistory: [{
    gameId: String,
    gameType: String,
    score: Number,
    accuracy: Number,
    timeSpent: Number,
    difficulty: String,
    completedAt: Date,
    skillsTagged: [String]
  }],
  employabilityScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.calculateLevel = function() {
  // Level = floor(sqrt(XP / 100)) + 1
  this.level = Math.floor(Math.sqrt(this.xp / 100)) + 1;
  return this.level;
};

userSchema.methods.calculateEmployabilityScore = function() {
  let score = 0;
  const skillWeights = {
    DSA: 0.25,
    ML: 0.20,
    DBMS: 0.15,
    Aptitude: 0.15,
    Frontend: 0.15,
    Backend: 0.10
  };

  Object.keys(this.skills).forEach(skill => {
    const skillData = this.skills[skill];
    if (skillData && skillData.accuracy && skillData.attempts) {
      const skillScore = (skillData.accuracy / 100) * (Math.min(skillData.attempts, 50) / 50) * 100;
      score += skillScore * (skillWeights[skill] || 0.1);
    }
  });

  // Add bonus for badges and level
  score += this.badges.length * 5;
  score += this.level * 2;
  
  this.employabilityScore = Math.min(Math.round(score), 100);
  return this.employabilityScore;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
