export function playCashRegisterSound() {
  try {
    const ctx = new AudioContext()

    const notes = [1318.51, 1567.98, 2093.00, 2637.02]
    const durations = [0.08, 0.08, 0.08, 0.15]
    let startTime = ctx.currentTime

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.15, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + durations[i])

      osc.start(startTime)
      osc.stop(startTime + durations[i])
      startTime += durations[i] + 0.02
    })

    const coinOsc = ctx.createOscillator()
    const coinGain = ctx.createGain()
    coinOsc.connect(coinGain)
    coinGain.connect(ctx.destination)
    coinOsc.type = 'sine'
    coinOsc.frequency.setValueAtTime(987.77, startTime + 0.05)
    coinOsc.frequency.linearRampToValueAtTime(1318.51, startTime + 0.2)
    coinGain.gain.setValueAtTime(0.2, startTime + 0.05)
    coinGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
    coinOsc.start(startTime + 0.05)
    coinOsc.stop(startTime + 0.4)
  } catch {}
}
