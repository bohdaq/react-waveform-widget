export interface PeakData {
  min: number;
  max: number;
}

/**
 * Reduces one or more audio channels into a fixed number of min/max peak
 * pairs, one per output bar, by scanning each bar's sample range across all
 * channels.
 */
export function computePeaks(
  channelData: Float32Array[],
  numberOfPeaks: number
): PeakData[] {
  if (numberOfPeaks <= 0 || channelData.length === 0) return [];

  const length = channelData[0].length;
  if (length === 0) {
    return Array.from({ length: numberOfPeaks }, () => ({ min: 0, max: 0 }));
  }

  const samplesPerPeak = length / numberOfPeaks;
  const peaks: PeakData[] = new Array(numberOfPeaks);

  for (let i = 0; i < numberOfPeaks; i++) {
    const start = Math.floor(i * samplesPerPeak);
    const end = Math.max(start + 1, Math.floor((i + 1) * samplesPerPeak));
    let min = 0;
    let max = 0;

    for (const data of channelData) {
      const segmentEnd = Math.min(end, data.length);
      for (let j = start; j < segmentEnd; j++) {
        const value = data[j];
        if (value > max) max = value;
        if (value < min) min = value;
      }
    }

    peaks[i] = { min, max };
  }

  return peaks;
}
