import { useState } from "react";
import { Waveform } from "react-waveform-widget";

export function App() {
  const [progress, setProgress] = useState(0.35);

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>react-waveform-widget</h1>

      <h2>Responsive, with progress + seek</h2>
      <Waveform
        src="/sample.wav"
        height={100}
        progress={progress}
        onSeek={setProgress}
        onLoad={(buf) => console.log("loaded", buf.duration)}
        onError={(err) => console.error("waveform error", err)}
      />

      <h2>Fixed width, non-responsive</h2>
      <Waveform
        src="/sample.wav"
        responsive={false}
        width={400}
        height={60}
        color="#c4b5fd"
        progressColor="#7c3aed"
        progress={0.6}
        barWidth={3}
        gap={2}
      />
    </div>
  );
}
