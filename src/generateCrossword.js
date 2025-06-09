function placeWord(grid, positions, word, direction, x, y) {
  const letters = word.split('');
  for (let i = 0; i < letters.length; i++) {
    const cx = direction === 'across' ? x + i : x;
    const cy = direction === 'down' ? y + i : y;
    const key = `${cx},${cy}`;
    if (grid[key] && grid[key] !== letters[i]) {
      return false; // conflict
    }
    // check same direction overlap
    if (positions[key] && positions[key] !== direction) {
      // allowed crossing
    } else if (positions[key] && positions[key] === direction) {
      return false; // overlap same orientation
    }
  }
  // place letters
  for (let i = 0; i < letters.length; i++) {
    const cx = direction === 'across' ? x + i : x;
    const cy = direction === 'down' ? y + i : y;
    const key = `${cx},${cy}`;
    grid[key] = letters[i];
    positions[key] = direction;
  }
  return true;
}

function generateCrossword(pairs) {
  if (!Array.isArray(pairs) || pairs.length < 5) {
    throw new Error('At least 5 question-answer pairs required');
  }
  const grid = {}; // key -> letter
  const posDirs = {}; // key -> direction
  const placedWords = [];

  // place first word at (0,0) across
  const first = pairs[0];
  const answer0 = first.answer.toUpperCase();
  placeWord(grid, posDirs, answer0, 'across', 0, 0);
  placedWords.push({
    clue: first.question,
    answer: answer0,
    x: 0,
    y: 0,
    direction: 'across'
  });

  for (let idx = 1; idx < pairs.length; idx++) {
    const { question, answer } = pairs[idx];
    const word = answer.toUpperCase();
    let placed = false;
    // try to intersect existing words
    for (const placedWord of placedWords) {
      const letters = placedWord.answer.split('');
      const targetLetters = word.split('');
      for (let i = 0; i < targetLetters.length && !placed; i++) {
        for (let j = 0; j < letters.length && !placed; j++) {
          if (targetLetters[i] === letters[j]) {
            const x = placedWord.direction === 'across'
              ? placedWord.x + j
              : placedWord.x - i;
            const y = placedWord.direction === 'down'
              ? placedWord.y + j
              : placedWord.y - i;
            const direction = placedWord.direction === 'across' ? 'down' : 'across';
            if (placeWord(grid, posDirs, word, direction, x, y)) {
              placedWords.push({ clue: question, answer: word, x, y, direction });
              placed = true;
            }
          }
        }
      }
    }
    if (!placed) {
      // place word after previous one vertically below
      let maxY = 0;
      for (const k in grid) {
        const [, yStr] = k.split(',');
        const y = parseInt(yStr, 10);
        if (y > maxY) maxY = y;
      }
      const x = 0;
      const y = maxY + 2; // gap line
      if (placeWord(grid, posDirs, word, 'across', x, y)) {
        placedWords.push({ clue: question, answer: word, x, y, direction: 'across' });
      }
    }
  }

  // determine width and height
  let minX = 0, minY = 0, maxX = 0, maxY = 0;
  Object.keys(grid).forEach(k => {
    const [xStr, yStr] = k.split(',');
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });

  // shift coordinates to positive
  if (minX < 0 || minY < 0) {
    const dx = -minX;
    const dy = -minY;
    placedWords.forEach(w => {
      w.x += dx;
      w.y += dy;
    });
    maxX += dx;
    maxY += dy;
  }

  return {
    words: placedWords,
    width: maxX + 1,
    height: maxY + 1,
  };
}

module.exports = generateCrossword;
