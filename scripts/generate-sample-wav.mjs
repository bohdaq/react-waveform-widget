// Generates a small synthetic WAV file (varying-amplitude sine sweep) so the
// example app has something visually interesting to render without shipping
// a binary audio fixture or fetching one from the network.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "example", "public", "sample.wav");

const sampleRate = 44100;
const durationSeconds = 6;
const numSamples = sampleRate * durationSeconds;
const numChannels = 1;
const bytesPerSample = 2;

const dataSize = numSamples * numChannels * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const envelope = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.15 * t);
  const tone = Math.sin(2 * Math.PI * 220 * t) * envelope;
  const sample = Math.max(-1, Math.min(1, tone));
  buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * bytesPerSample);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
