const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  clue: String,
  answer: String,
  x: Number,
  y: Number,
  direction: {
    type: String,
    enum: ['across', 'down'],
  }
}, {_id: false});

const crosswordSchema = new mongoose.Schema({
  words: [wordSchema],
  width: Number,
  height: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Crossword', crosswordSchema);
