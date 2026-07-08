import { useEffect, useState } from "react";

export type AudioSource = string | ArrayBuffer | AudioBuffer;

interface AudioBufferState {
  audioBuffer: AudioBuffer | null;
  loading: boolean;
  error: Error | null;
}

export function useAudioBuffer(source?: AudioSource): AudioBufferState {
  const [state, setState] = useState<AudioBufferState>({
    audioBuffer: source instanceof AudioBuffer ? source : null,
    loading: !!source && !(source instanceof AudioBuffer),
    error: null,
  });

  useEffect(() => {
    if (!source) {
      setState({ audioBuffer: null, loading: false, error: null });
      return;
    }

    if (source instanceof AudioBuffer) {
      setState({ audioBuffer: source, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ audioBuffer: null, loading: true, error: null });

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    const decode = async () => {
      try {
        const arrayBuffer =
          typeof source === "string"
            ? await (await fetch(source)).arrayBuffer()
            : source.slice(0);
        const context = new AudioContextClass();
        const decoded = await context.decodeAudioData(arrayBuffer);
        await context.close();
        if (!cancelled) setState({ audioBuffer: decoded, loading: false, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            audioBuffer: null,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      }
    };

    decode();

    return () => {
      cancelled = true;
    };
  }, [source]);

  return state;
}
