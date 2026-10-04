/**
 * Generates a clean 16-bit PCM, 44.1 kHz, mono WAV chime arpeggio
 * for the Streakly focus alarm.
 *
 * Re-run command:
 *   node scripts/generate-sounds.js
 */
const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 22050;
const DURATION_SEC = 4.2;
const TOTAL_SAMPLES = Math.floor(SAMPLE_RATE * DURATION_SEC);

// Arpeggio notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
const NOTES = [
  { freq: 523.25, start: 0.0, decay: 1.8 },
  { freq: 659.25, start: 0.35, decay: 1.8 },
  { freq: 783.99, start: 0.7, decay: 2.0 },
  { freq: 1046.5, start: 1.05, decay: 2.8 },
];

const samples = new Float32Array(TOTAL_SAMPLES);

for (const note of NOTES) {
  const startSample = Math.floor(note.start * SAMPLE_RATE);
  for (let i = startSample; i < TOTAL_SAMPLES; i++) {
    const t = (i - startSample) / SAMPLE_RATE;
    const env = Math.exp(-t * (3.0 / note.decay));

    // Fundamental + bell-like overtones
    const fundamental = Math.sin(2 * Math.PI * note.freq * t);
    const overtone1 = 0.45 * Math.sin(2 * Math.PI * note.freq * 2.0 * t);
    const overtone2 = 0.25 * Math.sin(2 * Math.PI * note.freq * 3.01 * t);
    const overtone3 = 0.12 * Math.sin(2 * Math.PI * note.freq * 4.18 * t);

    samples[i] += (fundamental + overtone1 + overtone2 + overtone3) * env;
  }
}

// Fade out last 0.3 seconds to avoid clicks
const fadeOutDuration = 0.3;
const fadeOutSamples = Math.floor(fadeOutDuration * SAMPLE_RATE);
const fadeStart = TOTAL_SAMPLES - fadeOutSamples;
for (let i = fadeStart; i < TOTAL_SAMPLES; i++) {
  const progress = (TOTAL_SAMPLES - i) / fadeOutSamples;
  samples[i] *= progress;
}

// Normalize to peak 0.92
let maxAmp = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const abs = Math.abs(samples[i]);
  if (abs > maxAmp) maxAmp = abs;
}
if (maxAmp > 0) {
  const gain = 0.92 / maxAmp;
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    samples[i] *= gain;
  }
}

// Build 16-bit PCM WAV
const dataSize = TOTAL_SAMPLES * 2;
const buffer = Buffer.alloc(44 + dataSize);

// RIFF chunk descriptor
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);

// "fmt " sub-chunk
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
buffer.writeUInt16LE(1, 22); // NumChannels (1 = mono)
buffer.writeUInt32LE(SAMPLE_RATE, 24); // SampleRate
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
buffer.writeUInt16LE(2, 32); // BlockAlign (NumChannels * BitsPerSample/8)
buffer.writeUInt16LE(16, 34); // BitsPerSample (16 bits)

// "data" sub-chunk
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

// Write 16-bit signed PCM samples
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const clamped = Math.max(-1, Math.min(1, samples[i]));
  const int16 = clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff);
  buffer.writeInt16LE(int16, 44 + i * 2);
}

const outDir = path.join(__dirname, "..", "assets", "sounds");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "focus_chime.wav");
fs.writeFileSync(outFile, buffer);
console.log(`Generated focus chime: ${outFile} (${buffer.length} bytes, ${DURATION_SEC}s)`);
