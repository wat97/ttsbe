const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri;
  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('TTS API integration', () => {
  it('POST /api/tts should create crossword', async () => {
    const pairs = [
      { question: 'q1', answer: 'apple' },
      { question: 'q2', answer: 'pear' },
      { question: 'q3', answer: 'grape' },
      { question: 'q4', answer: 'melon' },
      { question: 'q5', answer: 'berry' }
    ];

    const res = await request(app)
      .post('/api/tts')
      .send(pairs)
      .expect(201);

    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/ttsToday should return today\'s crossword clues', async () => {
    const res = await request(app)
      .get('/api/ttsToday')
      .expect(200);

    expect(Array.isArray(res.body.words)).toBe(true);
    res.body.words.forEach(w => {
      expect(w).toHaveProperty('x');
      expect(w).toHaveProperty('y');
      expect(w).toHaveProperty('direction');
      expect(w).toHaveProperty('clue');
    });
  });
});
