const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['quiz', 'coding', 'simulation'], 
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  skillsTagged: [{ type: String }],
  xpReward: { type: Number, default: 10 },
  timeLimit: { type: Number }, // in seconds
  gameData: { type: mongoose.Schema.Types.Mixed }, // Full JSON game data
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Game || mongoose.model('Game', gameSchema);
