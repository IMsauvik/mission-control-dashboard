import { useEffect, useRef } from 'react';

// Tiny 1×1 transparent looping MP4 — keeps WebOS browser from sleeping
// when Wake Lock API is unavailable (most WebOS 3/4 versions)
const BLANK_VIDEO_SRC = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAAGm1kYXQAAAITBgX/xgBDAADBAAB//h4FAAhBgAAABAAHAABAAAAIAAAABg==';

const SIX_HOURS = 6 * 60 * 60 * 1000;

export function useKioskMode() {
  const wakeLockRef = useRef(null);
  const videoRef = useRef(null);

  // ── Wake Lock ──────────────────────────────────────────────────────────────
  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // silently fall back to video trick
    }
  }

  // ── Invisible video loop (WebOS fallback) ─────────────────────────────────
  function startVideoLoop() {
    if (videoRef.current) return; // already running
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

  useEffect(() => {
    requestWakeLock();
    startVideoLoop();

    // Re-acquire wake lock when tab regains visibility
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') requestWakeLock();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Hard-reload every 6 hours — clears memory leaks on long-running TV displays
    const reloadTimer = setTimeout(() => window.location.reload(), SIX_HOURS);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearTimeout(reloadTimer);
      wakeLockRef.current?.release().catch(() => {});
      videoRef.current?.remove();
    };
  }, []);
}
