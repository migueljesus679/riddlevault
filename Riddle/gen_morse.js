// Generates a Morse code WAV file (16-bit PCM, mono, 44100Hz)
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const FREQ = 680;       // Hz - classic Morse tone
const UNIT = 0.10;      // seconds per dot unit
const AMPLITUDE = 28000; // max 32767

const MORSE_MAP = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....',
  I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.', O:'---', P:'.--.',
  Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-', V:'...-', W:'.--', X:'-..-',
  Y:'-.--', Z:'--..'
};

function tone(durationSec) {
  const n = Math.floor(SAMPLE_RATE * durationSec);
  const buf = [];
  for (let i = 0; i < n; i++) {
    // Envelope to avoid clicks
    const env = Math.min(1, Math.min(i, n - i) / (SAMPLE_RATE * 0.005));
    const v = Math.round(env * AMPLITUDE * Math.sin(2 * Math.PI * FREQ * i / SAMPLE_RATE));
    buf.push(v);
  }
  return buf;
}

function silence(durationSec) {
  return new Array(Math.floor(SAMPLE_RATE * durationSec)).fill(0);
}

function textToSamples(text) {
  const words = text.toUpperCase().split(' ');
  const samples = [];
  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi];
    for (let li = 0; li < word.length; li++) {
      const code = MORSE_MAP[word[li]];
      if (!code) continue;
      for (let si = 0; si < code.length; si++) {
        if (si > 0) samples.push(...silence(UNIT));           // inter-symbol gap
        if (code[si] === '.') samples.push(...tone(UNIT));    // dot
        else                  samples.push(...tone(UNIT * 3));// dash
      }
      if (li < word.length - 1) samples.push(...silence(UNIT * 3)); // inter-letter gap
    }
    if (wi < words.length - 1) samples.push(...silence(UNIT * 7)); // word gap
  }
  return samples;
}

function writeWav(filePath, samples) {
  const dataLen = samples.length * 2;
  const buf = Buffer.alloc(44 + dataLen);

  // RIFF header
  buf.write('RIFF', 0);                      buf.writeUInt32LE(36 + dataLen, 4);
  buf.write('WAVE', 8);                      buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);                 buf.writeUInt16LE(1, 20);  // PCM
  buf.writeUInt16LE(1, 22);                  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);    buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);                 buf.write('data', 36);
  buf.writeUInt32LE(dataLen, 40);

  for (let i = 0; i < samples.length; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, samples[i])), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
  console.log(`Written: ${filePath} (${(buf.length / 1024).toFixed(1)} KB)`);
}

// Generate with 1s silence at start and end
const message = 'MYSTERY';
const samples = [...silence(1), ...textToSamples(message), ...silence(1)];
const outPath = path.join(__dirname, 'backend/assets/audio/riddle_11.wav');
writeWav(outPath, samples);
