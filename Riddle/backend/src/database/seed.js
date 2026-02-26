const path = require('path');
const bcrypt = require('bcryptjs');
const { getDb, closeDb } = require('./db');
const { hashAnswer } = require('../utils/answerHash');
const { createStegoImage } = require('../utils/steganography');

const IMAGES_DIR = path.join(__dirname, '../../assets/images');

const RIDDLES = [
  // ─── EASY ────────────────────────────────────────────────────────────────────
  {
    title: 'The Voice of Wind',
    description:
      'I speak without a mouth and hear without ears.\nI have no body, but I come alive with the wind.\nWhat am I?',
    difficulty: 'easy',
    answer: 'echo',
    hint: 'You have heard me in mountains, canyons, and empty halls.',
    points_reward: 10,
    order_index: 1,
  },
  {
    title: 'Trail of the Wanderer',
    description:
      'The more you take, the more you leave behind.\nWhat am I?',
    difficulty: 'easy',
    answer: 'footsteps',
    hint: 'Think about what you leave on the ground as you walk.',
    points_reward: 10,
    order_index: 2,
  },
  {
    title: 'A World Without Life',
    description:
      'I have cities, but no houses live there.\nI have mountains, but no trees grow there.\nI have water, but no fish swim there.\nWhat am I?',
    difficulty: 'easy',
    answer: 'map',
    hint: 'Explorers use me to navigate the real world.',
    points_reward: 10,
    order_index: 3,
  },
  {
    title: 'The Invisible Weight',
    description:
      'I am lighter than a feather,\nyet the strongest man cannot hold me for five minutes.\nWhat am I?',
    difficulty: 'easy',
    answer: 'breath',
    hint: 'You do it thousands of times a day without thinking.',
    points_reward: 10,
    order_index: 4,
  },
  {
    title: 'Hands Without Applause',
    description:
      'I have hands, but I cannot clap.\nI have a face, but I cannot smile.\nI tell the truth, but I never speak.\nWhat am I?',
    difficulty: 'easy',
    answer: 'clock',
    hint: 'Look at the wall and it will tell you the answer.',
    points_reward: 10,
    order_index: 5,
  },

  // ─── MEDIUM ──────────────────────────────────────────────────────────────────
  {
    title: 'The Captive Worker',
    description:
      'I am taken from a mine and shut in a wooden case,\nfrom which I am never released,\nand yet I am used by almost every person.\nWhat am I?',
    difficulty: 'medium',
    answer: 'pencil',
    hint: 'Writers, artists, and students rely on me. My core is not metal.',
    points_reward: 25,
    order_index: 6,
  },
  {
    title: 'Head and Tail',
    description:
      'I have a head, and I have a tail,\nbut I have no body in between.\nKings and presidents carry my face.\nWhat am I?',
    difficulty: 'medium',
    answer: 'coin',
    hint: 'You flip me to make decisions. I live in your pocket.',
    points_reward: 25,
    order_index: 7,
  },
  {
    title: 'The Unwanted Gift',
    description:
      'The man who makes it does not need it.\nThe man who buys it does not want it.\nThe man who uses it does not know it.\nWhat is it?',
    difficulty: 'medium',
    answer: 'coffin',
    hint: 'This object marks the very end of a journey.',
    points_reward: 25,
    order_index: 8,
  },
  {
    title: 'The Eternal Promise',
    description:
      'I can be given, yet I am kept.\nI can be broken, yet I am never held.\nI cost nothing to make but mean everything to keep.\nWhat am I?',
    difficulty: 'medium',
    answer: 'word',
    hint: 'A promise, a vow, an oath — all synonyms for what I am.',
    points_reward: 25,
    order_index: 9,
  },
  {
    title: 'The Faithful Servant',
    description:
      'I shrink smaller every time you use me,\nyet I serve you most faithfully when I am almost gone.\nI bring light to darkness and warmth to cold.\nWhat am I?',
    difficulty: 'medium',
    answer: 'candle',
    hint: 'A dinner table favourite. Made of wax. Burns from the top.',
    points_reward: 25,
    order_index: 10,
  },

  // ─── HARD ─────────────────────────────────────────────────────────────────────
  {
    title: 'Intercepted Signal',
    description:
      'A distress call was intercepted from the deep ocean.\nThe transmission was corrupted — only dots and dashes survived.\nDecode the Morse code to find the hidden word:\n\n  -- -.-- ... - . .-. -.--\n\nWhat was the distress call?',
    difficulty: 'hard',
    answer: 'mystery',
    hint: 'Morse code: each letter is separated by a space. Use a Morse alphabet chart to decode letter by letter.',
    points_reward: 50,
    order_index: 11,
  },
  {
    title: 'The Roman Order',
    description:
      'A Roman general encrypted his battle orders so the enemy could not read them.\nHis cipher: shift every letter 13 positions forward in the alphabet.\nThe encrypted order reads: FUNQBJ\n\nWhat was the original order?',
    difficulty: 'hard',
    answer: 'shadow',
    hint: 'ROT-13 is its own inverse. Apply the same shift to decode. F→S, U→H, N→A...',
    points_reward: 50,
    order_index: 12,
  },
  {
    title: 'The Vigenère Lock',
    description:
      'A message was locked using a Vigenère cipher.\nThe encryption key is: CIPHER\nThe encrypted text is: JMPYX\n\nDecrypt the message. What is hidden within?',
    difficulty: 'hard',
    answer: 'heart',
    hint: 'Vigenère decryption: for each letter, subtract the key letter value (mod 26). J-C=H, M-I=E, P-P=A, Y-H=R, X-E=T',
    points_reward: 50,
    order_index: 13,
  },
  {
    title: 'The Binary Whisper',
    description:
      'A machine speaks only in ones and zeros.\nListen carefully to what it says:\n\n  01000110  01001001  01010010  01000101\n\nEach group of 8 bits is one ASCII character.\nWhat word is the machine whispering?',
    difficulty: 'hard',
    answer: 'fire',
    hint: 'Convert each 8-bit binary number to decimal, then look up the ASCII character. 01000110 = 70 = F',
    points_reward: 50,
    order_index: 14,
  },
  {
    title: 'Hexadecimal Scripture',
    description:
      'An ancient programmer carved this sequence into stone:\n\n  4C  49  47  48  54\n\nEach pair of hexadecimal digits represents one ASCII character.\nWhat word was carved?',
    difficulty: 'hard',
    answer: 'light',
    hint: 'Convert hex to decimal first: 4C=76=L, 49=73=I, 47=71=G, 48=72=H, 54=84=T',
    points_reward: 50,
    order_index: 15,
  },

  // ─── ULTIMATE ─────────────────────────────────────────────────────────────────
  {
    title: 'The Painted Secret',
    description:
      'This image appears to be nothing more than a serene digital landscape.\nBut hidden within its pixels lies a secret name.\n\nThe truth is concealed in the Least Significant Bit (LSB) of the red channel.\nThe first 8 pixels encode the message length (as a binary byte).\nEach subsequent pixel\'s red channel LSB holds one bit of the secret.\n\nDownload the image and extract the hidden word. What is it?',
    difficulty: 'ultimate',
    answer: 'phoenix',
    hint: 'Use this Python script to decode:\n\nfrom PIL import Image\nimg = Image.open("riddle_16.png")\npx = list(img.getdata())\nlength = int(\'\'.join([str(p[0] & 1) for p in px[:8]]), 2)\nbits = \'\'.join([str(p[0] & 1) for p in px[8:8+length*8]])\nprint(\'\'.join([chr(int(bits[i:i+8],2)) for i in range(0,len(bits),8)]))',
    image_path: 'riddle_16.png',
    points_reward: 100,
    order_index: 16,
  },
  {
    title: 'The Ghost Chain',
    description:
      'Two ciphers. One answer.\n\nStep 1 — Decode this Morse code transmission:\n  --. .... --- ... -\nThe decoded word is your Vigenère key.\n\nStep 2 — Use that key to decrypt this Vigenère cipher:\n  GIMKL\n\nWhat is the final hidden word?',
    difficulty: 'ultimate',
    answer: 'abyss',
    hint: 'Step 1: --. =G, .... =H, --- =O, ... =S, - =T → key is GHOST\nStep 2: Vigenère decrypt GIMKL with key GHOST: G-G=A, I-H=B, M-O=Y, K-S=S, L-T=S → ABYSS',
    points_reward: 100,
    order_index: 17,
  },
  {
    title: 'The Armored Message',
    description:
      'A message arrived in a format resembling PGP armoring:\n\n-----BEGIN ENCRYPTED MESSAGE-----\nRU5JR01B\n-----END ENCRYPTED MESSAGE-----\n\nThe "encryption" used here is the most fundamental encoding scheme in computing.\nWhat word is hidden in the armored payload?',
    difficulty: 'ultimate',
    answer: 'enigma',
    hint: 'PGP uses Base64 armoring. Decode "RU5JR01B" using Base64. Every modern computer can decode this:\n- Python: import base64; base64.b64decode("RU5JR01B")\n- Browser console: atob("RU5JR01B")',
    points_reward: 100,
    order_index: 18,
  },
  {
    title: 'The Hidden Verse',
    description:
      'A poet hid a secret inside this verse.\nThe message does not lie in the meaning of the words — it hides in their structure.\n\n─────────────────────────────────────────\nCountless stars fill the night sky above,\nIn ancient codes and ciphers, wisdom lies,\nPiercing the veil of secrets, we seek truth,\nHidden in plain sight, the message calls,\nEach letter holds a key to unlock more,\nRevelations come to those who dare to look.\n─────────────────────────────────────────\n\nWhat is the hidden word?',
    difficulty: 'ultimate',
    answer: 'cipher',
    hint: 'Look at the very first letter of each line, from top to bottom. This technique is called an acrostic.',
    points_reward: 100,
    order_index: 19,
  },
  {
    title: 'The Final Lock',
    description:
      'You have reached the last cipher. Beyond this door lies true glory.\n\nA message was scrambled using a Rail Fence cipher with exactly 2 rails.\nDecrypt this to claim your prize:\n\n  LGNEED\n\nWhat is the word that guards the final door?',
    difficulty: 'ultimate',
    answer: 'legend',
    hint: 'Rail Fence (2 rails) for 6 chars: write chars on alternating rows (top: pos 0,2,4 → L,G,N / bottom: pos 1,3,5 → E,E,D). Read across rails: LGNEED. To decrypt: split into 2 groups of 3 and interleave: L_E_G_E_N_D',
    points_reward: 100,
    order_index: 20,
  },
];

function seed() {
  const db = getDb();

  const adminPassword = bcrypt.hashSync('Admin@1234', 12);
  db.prepare(`
    INSERT OR IGNORE INTO users (username, email, password_hash, role, points)
    VALUES (?, ?, ?, 'admin', 0)
  `).run('admin', 'admin@riddlevault.com', adminPassword);

  const insertRiddle = db.prepare(`
    INSERT OR IGNORE INTO riddles
      (title, description, difficulty, answer_hash, answer_plain, hint, image_path, points_reward, order_index, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  db.exec('BEGIN');
  try {
    for (const r of RIDDLES) {
      insertRiddle.run(
        r.title,
        r.description,
        r.difficulty,
        hashAnswer(r.answer),
        r.answer,
        r.hint,
        r.image_path || null,
        r.points_reward,
        r.order_index
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const stegoRiddle = RIDDLES.find(r => r.image_path === 'riddle_16.png');
  if (stegoRiddle) {
    const imgPath = path.join(IMAGES_DIR, 'riddle_16.png');
    createStegoImage('PHOENIX', imgPath);
  }

  console.log('✔  Database seeded successfully.');
  console.log('   Admin credentials → username: admin  |  password: Admin@1234');
  console.log(`   Riddles inserted: ${RIDDLES.length}`);
}

// Only close the DB when this file is run directly (not when imported)
if (require.main === module) {
  seed();
  closeDb();
}

module.exports = { seed };
