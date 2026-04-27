import { useEffect, useRef } from 'react';

const BLANK_VIDEO_SRC = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAAGm1kYXQAAAITBgX/xgBDAADBAAB//h4FAAhBgAAABAAHAABAAAAIAAAABg==';

// YouTube video played silently in a hidden 1×1px iframe.
// LG WebOS firmware treats any active YouTube/video playback as "content playing"
// and definitively suppresses the screensaver — more reliable than all JS tricks.
const YT_EMBED = 'https://www.youtube.com/embed/x8ACsWl36L8?autoplay=1&loop=1&mute=1&playlist=x8ACsWl36L8&controls=0&rel=0&playsinline=1';

const SIX_HOURS = 6 * 60 * 60 * 1000;
const NUDGE_MS  = 60 * 1000;

export function useKioskMode() {
  const wakeLockRef = useRef(null);
  const videoRef    = useRef(null);
  const iframeRef   = useRef(null);
  const audioRef    = useRef(null);
  const rafRef      = useRef(null);

  // ── 1. Hidden YouTube iframe — primary screensaver killer ────────────────
  // Positioned 1×1px off-screen. TV sees active video playback → no screensaver.
  function startYouTubeLoop() {
    if (iframeRef.current) return;
    const f = document.createElement('iframe');
    f.src = YT_EMBED;
    f.allow = 'autoplay; encrypted-media';
    Object.assign(f.style, {
      position: 'fixed', top: '-2px', left: '-2px',
      width: '2px', height: '2px',
      opacity: '0', pointerEvents: 'none',
      border: 'none',
    });
    document.body.appendChild(f);
    iframeRef.current = f;
  }

  // ── 2. Wake Lock API ──────────────────────────────────────────────────────
  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch {}
  }

  // ── 3. Invisible looping video (fallback) ─────────────────────────────────
  function startVideoLoop() {
    if (videoRef.current) return;
    const v = document.createElement('video');
    v.src = BLANK_VIDEO_SRC;
    v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
    Object.assign(v.style, { position: 'fixed', top: '-1px', left: '-1px', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' });
    document.body.appendChild(v);
    v.play().catch(() => {});
    videoRef.current = v;
  }

  // ── 4. Silent Web Audio (fallback) ────────────────────────────────────────
  function startSilentAudio() {
    if (audioRef.current) return;
    try {
      const AC = window.AudioContext || /** @type {any} */(window).webkitAudioContext;
      const ctx = new AC();
      const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.001;
      src.connect(gain); gain.connect(ctx.destination);
      src.start(0);
      audioRef.current = ctx;
    } catch {}
  }

  // ── 5. requestAnimationFrame loop ────────────────────────────────────────
  function startRafLoop() {
    function tick() { rafRef.current = requestAnimationFrame(tick); }
    rafRef.current = requestAnimationFrame(tick);
  }

  // ── 6. Periodic input nudge — resets OS idle timer ────────────────────────
  function nudgeSystemIdle() {
    const cx = Math.round(window.innerWidth  / 2);
    const cy = Math.round(window.innerHeight / 2);
    const opts = { bubbles: true, cancelable: true, clientX: cx, clientY: cy };
    try {
      document.dispatchEvent(new PointerEvent('pointermove', opts));
      document.dispatchEvent(new MouseEvent('mousemove', opts));
    } catch {}
    try { window.scrollBy(0, 1); window.scrollBy(0, -1); } catch {}
    try { if (audioRef.current?.state === 'suspended') audioRef.current.resume(); } catch {}
  }

  useEffect(() => {
    startYouTubeLoop();   // primary
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
      iframeRef.current?.remove();
      audioRef.current?.close().catch(() => {});
    };
  }, []);
}
