import { describe, expect, it } from "vitest";
import { computePeaks } from "./peaks";

describe("computePeaks", () => {
  it("returns an empty array when numberOfPeaks is 0", () => {
    expect(computePeaks([new Float32Array([1, 2, 3])], 0)).toEqual([]);
  });

  it("returns zeroed peaks for silent (empty) channel data", () => {
    expect(computePeaks([new Float32Array(0)], 4)).toEqual([
      { min: 0, max: 0 },
      { min: 0, max: 0 },
      { min: 0, max: 0 },
      { min: 0, max: 0 },
    ]);
  });

  it("finds min/max within each bucket for a single channel", () => {
    const data = new Float32Array([0.1, 0.5, -0.2, -0.9, 0.3, 0.05]);
    const peaks = computePeaks([data], 2);
    expect(peaks[0].min).toBeCloseTo(-0.2);
    expect(peaks[0].max).toBeCloseTo(0.5);
    expect(peaks[1].min).toBeCloseTo(-0.9);
    expect(peaks[1].max).toBeCloseTo(0.3);
  });

  it("merges min/max across multiple channels", () => {
    const left = new Float32Array([0.1, 0.2]);
    const right = new Float32Array([-0.4, 0.9]);
    const peaks = computePeaks([left, right], 1);
    expect(peaks[0].min).toBeCloseTo(-0.4);
    expect(peaks[0].max).toBeCloseTo(0.9);
  });

  it("covers every sample across buckets when peak count does not evenly divide length", () => {
    const data = new Float32Array([0, 0, 0, 0, 0, 7]);
    const peaks = computePeaks([data], 4);
    const sawMax = peaks.some((p) => p.max === 7);
    expect(sawMax).toBe(true);
  });
});
