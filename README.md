# react-waveform-widget

A lightweight React component that renders an audio file's waveform on a `<canvas>`. Audio is decoded client-side with the Web Audio API — no server-side processing or precomputed peak data required.

## Install

```sh
npm install react-waveform-widget
```

`react` and `react-dom` (>=16.8) are peer dependencies.

## Usage

```tsx
import { Waveform } from "react-waveform-widget";

function Player() {
  const [progress, setProgress] = useState(0);

  return (
    <Waveform
      src="/song.mp3"
      progress={progress}
      onSeek={setProgress}
      onLoad={(audioBuffer) => console.log(audioBuffer.duration)}
    />
  );
}
```

`src` accepts a URL string, an `ArrayBuffer`, or an already-decoded `AudioBuffer`.

## Props

| Prop            | Type                                          | Default     | Description                                                        |
| --------------- | ---------------------------------------------- | ----------- | -------------------------------------------------------------------- |
| `src`           | `string \| ArrayBuffer \| AudioBuffer`         | —           | Audio to render.                                                     |
| `color`         | `string`                                       | `"#8a97a8"` | Bar color for the un-played portion.                                 |
| `progressColor` | `string`                                       | `"#3b82f6"` | Bar color for the played portion, up to `progress`.                  |
| `progress`      | `number`                                       | `0`         | Playback position as a 0..1 fraction.                                |
| `height`        | `number`                                       | `80`        | Height in pixels.                                                    |
| `barWidth`      | `number`                                       | `2`         | Width of each bar in pixels.                                         |
| `gap`           | `number`                                       | `1`         | Gap between bars in pixels.                                          |
| `responsive`    | `boolean`                                      | `true`      | Resize the canvas to fill its container's width.                     |
| `width`         | `number`                                       | `600`       | Fixed width in pixels, used only when `responsive` is `false`.       |
| `className`     | `string`                                       | —           | Applied to the wrapping `div`.                                       |
| `style`         | `React.CSSProperties`                          | —           | Applied to the wrapping `div`.                                       |
| `onLoad`        | `(audioBuffer: AudioBuffer) => void`           | —           | Called once decoding finishes.                                       |
| `onError`       | `(error: Error) => void`                       | —           | Called if fetching or decoding fails.                                |
| `onSeek`        | `(progress: number) => void`                   | —           | Called with a 0..1 fraction when the waveform is clicked.            |

The `computePeaks(channelData, numberOfPeaks)` utility used internally is also exported, for consumers who want to render peaks with their own drawing logic.

## Development

```sh
npm install
npm run build      # bundle with tsup -> dist/
npm test           # run unit tests
npm run typecheck

cd example
npm install
npm run dev         # try the component in a real browser
```

## License

MIT
