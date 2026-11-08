export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  muted = false;

  unlock() {
    const ctx = this.ensure();
    if (ctx && ctx.state === "suspended") void ctx.resume();
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(muted ? 0 : 0.45, this.ctx.currentTime, 0.02);
  }

  catch(combo: number) {
    const scale = [523.25, 587.33, 659.25, 783.99, 880];
    const freq = scale[Math.abs(combo) % scale.length];
    this.tone(freq, 0.16, "triangle", 0.22);
    this.tone(freq * 2, 0.08, "sine", 0.05);
  }

  hurt() {
    this.tone(96, 0.22, "square", 0.12);
    this.burstNoise(0.18, 240);
  }

  fever() {
    const ctx = this.ensure();
    if (!ctx || !this.sfx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.tone(freq, 0.2, "triangle", 0.16, ctx.currentTime + i * 0.07);
    });
  }

  chime() {
    this.tone(1046.5, 0.14, "sine", 0.1);
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    try {
      const ctx = new AudioContext({ latencyHint: "interactive" });
      const master = ctx.createGain();
      const sfx = ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.45;
      sfx.connect(master);
      master.connect(ctx.destination);
      const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.ctx = ctx;
      this.master = master;
      this.sfx = sfx;
      this.noise = noise;
      return ctx;
    } catch {
      return null;
    }
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    peak: number,
    when?: number,
  ) {
    const ctx = this.ctx;
    if (!ctx || !this.sfx) return;
    const start = when ?? ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * (0.72 + Math.random() * 0.08)), start + dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(this.sfx);
    osc.start(start);
    osc.stop(start + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  private burstNoise(dur: number, freq: number) {
    const ctx = this.ctx;
    if (!ctx || !this.sfx || !this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = freq;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfx);
    src.start(now);
    src.stop(now + dur);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }
}
