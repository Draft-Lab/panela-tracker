type ChimeKind = "join" | "leave"

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null
  }

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext

  if (!AudioCtx) {
    return null
  }

  if (!audioContext) {
    audioContext = new AudioCtx()
  }

  return audioContext
}

/** Soft two-note chime via Web Audio (no asset file). Fails silently if blocked. */
export function playLiveSessionChime(kind: ChimeKind): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) {
      return
    }

    if (ctx.state === "suspended") {
      void ctx.resume()
    }

    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.connect(ctx.destination)

    const notes =
      kind === "join"
        ? [
            { freq: 523.25, at: 0, dur: 0.12 },
            { freq: 659.25, at: 0.1, dur: 0.16 },
          ]
        : [
            { freq: 392.0, at: 0, dur: 0.14 },
            { freq: 329.63, at: 0.11, dur: 0.18 },
          ]

    const peak = kind === "join" ? 0.045 : 0.035

    master.gain.exponentialRampToValueAtTime(peak, now + 0.02)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.42)

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(note.freq, now + note.at)
      gain.gain.setValueAtTime(0.0001, now + note.at)
      gain.gain.exponentialRampToValueAtTime(1, now + note.at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.dur)
      osc.connect(gain)
      gain.connect(master)
      osc.start(now + note.at)
      osc.stop(now + note.at + note.dur + 0.02)
    }
  } catch {
    // Autoplay / unsupported — ignore
  }
}
