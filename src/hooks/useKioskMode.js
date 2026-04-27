import { useEffect, useRef } from 'react';

const BLANK_VIDEO_SRC = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAAGm1kYXQAAAITBgX/xgBDAADBAAB//h4FAAhBgAAABAAHAABAAAAIAAAABg==';

const SIX_HOURS = 6 * 60 * 60 * 1000;
const NUDGE_MS  = 60 * 1000; // every 60s — aggressive, well inside 30-min threshold

export function useKioskMode() {
  const wakeLockRef = useRef(null);
  const videoRef    = useRef(null);
  const audioRef    = useRef(null);
  const rafRef      = useRef(null);

  // ── 1. Wake Lock API ──────────────────────────────────────────────────────
  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch {}
  }

  // ── 2. Invisible looping video ────────────────────────────────────────────
  function startVideoLoop() {
    if (videoRef.current) return;
    const v = document.createElement('video');
    v.src = BLANK_VIDEO_SRC;
    v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
    Object.assign(v.style, { position:'fixed', top:'-1px', left:'-1px', width:'1px', height:'1px', opacity:'0', pointerEvents:'none' });
    document.body.appendChild(v);
    v.play().catch(() => {});
    videoRef.current = v;
  }

  // ── 3. Silent Web Audio — LG WebOS treats "audio playing" as active content
  //       and suppresses the screensaver, even at zero gain.
  function startSilentAudio() {
    if (audioRef.current) return;
    try {
      const AC = window.AudioContext || /** @type {any} */(window).webkitAudioContext;
      const ctx = new AC();
      const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.001; // essentially silent but "playing"
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(0);
      audioRef.current = ctx;
    } catch {}
  }

  // ── 4. requestAnimationFrame loop — keeps GPU/renderer active ────────────
  function startRafLoop() {
    function tick() { rafRef.current = requestAnimationFrame(tick); }
    rafRef.current = requestAnimationFrame(tick);
  }

  // ── 5. Simulate input events — resets OS-level idle timer ─────────────────
  // Combines pointer, mouse AND a tiny scroll nudge. The scroll is the most
  // reliable trigger on LG WebOS because it translates to a physical scroll
  // signal that the TV firmware counts as user activity.
  function nudgeSystemIdle() {
    const cx = Math.round(window.innerWidth  / 2);
    const cy = Math.round(window.innerHeight / 2);
    const opts = { bubbles: true, cancelable: true, clientX: cx, clientY: cy };
    try {
      document.dispatchEvent(new PointerEvent('pointermove', opts));
      document.dispatchEvent(new MouseEvent('mousemove', opts));
    } catch {}
    // Micro-scroll trick: scroll 1px down then back — registers as real input
    try {
      window.scrollBy(0, 1);
      window.scrollBy(0, -1);
    } catch {}
    // Resume audio context if the browser suspended it (happens after tab hide)
    try {
      if (audioRef.current?.state === 'suspended') audioRef.current.resume();
    } catch {}
  }

  useEffect(() => {
    requestWakeLock();
    startVideoLoop();
    startSilentAudio();
    startRafLoop();

    nudgeSystemIdle();
    const nudgeTimer = setInterval(nudgeSystemIdle, NUDGE_MS);

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
        nudgeSystemIdle();
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    // User interaction (remote press) resumes audio context
    function onInteract() {
      try { audioRef.current?.resume(); } catch {}
    }
    document.addEventListener('click', onInteract);
    document.addEventListener('keydown', onInteract);

    const reloadTimer = setTimeout(() => window.location.reload(), SIX_HOURS);

    return () => {
      clearInterval(nudgeTimer);
      clearTimeout(reloadTimer);
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('click', onInteract);
      document.removeEventListener('keydown', onInteract);
      wakeLockRef.current?.release().catch(() => {});
      videoRef.current?.remove();
      audioRef.current?.close().catch(() => {});
    };
  }, []);
}
