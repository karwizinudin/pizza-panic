// Pizza Panic — tiny WebAudio sound effects, no audio files needed.
var SoundFX = (function () {
  var ctx = null;
  var muted = false;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    if (muted) return;
    var c = ensure();
    if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol || 0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  return {
    toggleMute: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; },
    pop: function () { tone(520, 0.09, "triangle", 0.14); },
    place: function () { tone(300, 0.12, "sine", 0.14); tone(420, 0.1, "sine", 0.1, 0.06); },
    ding: function () { tone(880, 0.25, "sine", 0.14); tone(1318, 0.3, "sine", 0.1, 0.09); },
    chaChing: function () { tone(988, 0.12, "square", 0.08); tone(1319, 0.12, "square", 0.08, 0.1); tone(1568, 0.28, "square", 0.08, 0.2); },
    buzz: function () { tone(140, 0.3, "sawtooth", 0.12); tone(110, 0.3, "sawtooth", 0.1, 0.12); },
    tick: function () { tone(1000, 0.05, "square", 0.05); }
  };
})();
