const express = require('express');
const mongoose = require('mongoose');
const generateCrossword = require('./generateCrossword');
const Crossword = require('../models/Crossword');

const app = express();
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tts';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo connection error:', err));

// POST /api/tts
app.post('/api/tts', async (req, res) => {
  const pairs = req.body && Array.isArray(req.body) ? req.body : req.body?.pairs;
  try {
    const crosswordData = generateCrossword(pairs);
    const crossword = await Crossword.create(crosswordData);
    res.status(201).json({ id: crossword._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/ttsToday
app.get('/api/ttsToday', async (req, res) => {
  const crossword = await Crossword.findOne().sort({ createdAt: -1 }).lean();
  if (!crossword) return res.status(404).json({ error: 'No crossword found' });

  const response = crossword.words.map(w => ({
    x: w.x,
    y: w.y,
    direction: w.direction,
    clue: w.clue,
  }));

  res.json({ id: crossword._id, width: crossword.width, height: crossword.height, words: response });
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
