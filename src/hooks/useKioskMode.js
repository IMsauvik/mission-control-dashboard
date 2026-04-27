import { useEffect, useRef } from 'react';

// Tiny 1×1 transparent looping MP4 — keeps WebOS browser from sleeping
// when Wake Lock API is unavailable (most WebOS 3/4 versions)
const BLANK_VIDEO_SRC = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAAGm1kYXQAAAITBgX/xgBDAADBAAB//h4FAAhBgAAABAAHAABAAAAIAAAABg==';

const SIX_HOURS  = 6 * 60 * 60 * 1000;
const NUDGE_MS   = 2 * 60 * 1000;   // fake input every 2 min — well inside 30-min screensaver

export function useKioskMode() {
  const wakeLockRef = useRef(null);
  const videoRef    = useRef(null);
  const rafRef      = useRef(null);

  // ── Wake Lock ──────────────────────────────────────────────────────────────
  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch { /* fall through to other methods */ }
  }

  // ── Invisible video loop (WebOS fallback) ─────────────────────────────────
  function startVideoLoop() {
    if (videoRef.current) return;
    const v = document.createElement('video');
    v.src = BLANK_VIDEO_SRC;
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    Object.assign(v.style, {
      position: 'fixed', top: '-1px', left: '-1px',
      width: '1px', height: '1px', opacity: '0', pointerEvents: 'none',
    });
    document.body.appendChild(v);
    v.play().catch(() => {});
    videoRef.current = v;
  }

  // ── requestAnimationFrame loop — keeps browser renderer ticking ───────────
  function startRafLoop() {
    function tick() { rafRef.current = requestAnimationFrame(tick); }
    rafRef.current = requestAnimationFrame(tick);
  }

  // ── Fake pointer/mouse events — resets WebOS system idle timer ───────────
  // WebOS screensaver is triggered by the OS-level idle timer, not the browser.
  // Dispatching PointerEvent + MouseEvent nudges the system into thinking
  // a user is interacting, resetting the idle counter.
  function nudgeSystemIdle() {
    const cx = Math.round(window.innerWidth  / 2);
    const cy = Math.round(window.innerHeight / 2);
    const opts = { bubbles: true, cancelable: true, clientX: cx, clientY: cy };
    try {
      document.dispatchEvent(new PointerEvent('pointermove', opts));
      document.dispatchEvent(new MouseEvent('mousemove',    opts));
    } catch { /* older WebOS may not support PointerEvent */ }
  }

  useEffect(() => {
    requestWakeLock();
    startVideoLoop();
    startRafLoop();

    // Fire immediately, then every 2 minutes
    nudgeSystemIdle();
    const nudgeTimer = setInterval(nudgeSystemIdle, NUDGE_MS);

    // Re-acquire wake lock when TV wakes from standby
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
        nudgeSystemIdle();
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Hard-reload every 6 hours — clears memory leaks on long-running displays
    const reloadTimer = setTimeout(() => window.location.reload(), SIX_HOURS);

    return () => {
      clearInterval(nudgeTimer);
      clearTimeout(reloadTimer);
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      wakeLockRef.current?.release().catch(() => {});
      videoRef.current?.remove();
    };
  }, []);
}
