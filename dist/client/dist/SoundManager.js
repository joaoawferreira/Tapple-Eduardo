export class SoundManager {
    context = null;
    enabled = true;
    volume = 0.35;
    // Substitua valores por caminhos, por exemplo: "./assets/audio/letter.mp3".
    files = {};
    notes = {
        letter: [660], turn: [440, 660], warning: [880],
        timeout: [330, 220, 110], victory: [523, 659, 784, 1047]
    };
    unlock() {
        if (!this.enabled)
            return;
        try {
            this.context ??= new AudioContext();
            void this.context.resume().catch(() => { });
        }
        catch { /* O jogo continua em navegadores sem áudio. */ }
    }
    play(name) {
        if (!this.enabled || this.volume === 0)
            return;
        const file = this.files[name];
        if (file) {
            const audio = new Audio(file);
            audio.volume = this.volume;
            void audio.play().catch(() => { });
            return;
        }
        const context = this.context;
        if (!context || context.state !== "running")
            return;
        this.notes[name].forEach((frequency, index) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const start = context.currentTime + index * 0.11;
            oscillator.type = "sine";
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(this.volume * 0.16, start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(start);
            oscillator.stop(start + 0.12);
            oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        });
    }
}
