const crypto = require('crypto');

function normalize(answer) {
  return answer.toLowerCase().trim().replace(/\s+/g, ' ').trim();
}

function hashAnswer(answer) {
  return crypto.createHash('sha256').update(normalize(answer)).digest('hex');
}

module.exports = { normalize, hashAnswer };
