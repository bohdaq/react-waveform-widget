import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAudioBuffer, type AudioSource } from "./hooks/useAudioBuffer";
import { computePeaks } from "./utils/peaks";

export interface WaveformProps {
  /** Audio to render: a URL, an ArrayBuffer, or an already-decoded AudioBuffer. */
  src?: AudioSource;
  /** Bar color for the un-played portion. */
  color?: string;
  /** Bar color for the played portion, up to `progress`. */
  progressColor?: string;
  /** Playback position as a 0..1 fraction. Bars before this point use `progressColor`. */
  progress?: number;
  /** Height of the waveform in pixels. */
  height?: number;
  /** Width of each bar in pixels. */
  barWidth?: number;
  /** Gap between bars in pixels. */
  gap?: number;
  /** Resize the canvas to fill its container's width. Defaults to true. */
  responsive?: boolean;
  /** Fixed width in pixels, used only when `responsive` is false. */
  width?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Called once the audio has been decoded. */
  onLoad?: (audioBuffer: AudioBuffer) => void;
  /** Called if fetching or decoding the audio fails. */
  onError?: (error: Error) => void;
  /** Called with a 0..1 fraction when the waveform is clicked, e.g. to seek playback. */
  onSeek?: (progress: number) => void;
}

const DEFAULT_WIDTH = 600;

export function Waveform({
  src,
  color = "#8a97a8",
  progressColor = "#3b82f6",
  progress = 0,
  height = 80,
  barWidth = 2,
  gap = 1,
  responsive = true,
  width,
  className,
  style,
  onLoad,
  onError,
  onSeek,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const { audioBuffer, error } = useAudioBuffer(src);

  useEffect(() => {
    if (!responsive) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setMeasuredWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [responsive]);

  useEffect(() => {
    if (audioBuffer) onLoad?.(audioBuffer);
  }, [audioBuffer, onLoad]);

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  const effectiveWidth = responsive ? measuredWidth : width ?? DEFAULT_WIDTH;

  const peaks = useMemo(() => {
    if (!audioBuffer || effectiveWidth <= 0) return [];
    const channelData: Float32Array[] = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }
    const barCount = Math.max(1, Math.floor(effectiveWidth / (barWidth + gap)));
    return computePeaks(channelData, barCount);
  }, [audioBuffer, effectiveWidth, barWidth, gap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || effectiveWidth <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = effectiveWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${effectiveWidth}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, effectiveWidth, height);

    const mid = height / 2;
    const progressIndex = Math.floor(peaks.length * progress);

    peaks.forEach((peak, i) => {
      const x = i * (barWidth + gap);
      const barHeight = Math.max(1, (peak.max - peak.min) * mid);
      const y = mid - peak.max * mid;
      ctx.fillStyle = i < progressIndex ? progressColor : color;
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  }, [peaks, height, barWidth, gap, color, progressColor, progress, effectiveWidth]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    onSeek(Math.min(1, Math.max(0, fraction)));
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: responsive ? "100%" : effectiveWidth,
        height,
        cursor: onSeek ? "pointer" : undefined,
        ...style,
      }}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
