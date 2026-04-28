import { useState, useEffect, useRef } from 'react';

const VIDEOS = [
  'x8ACsWl36L8',
  'UeHQa6rs3Z4',
  'jwfpKhZwV58',
  'hiIbNaA_qao',
  'n6DBcYJ8wqY',
  'tRdPPgPrQ5U',
];

const SWITCH_MS = 10 * 60 * 1000;

export default function VideoCard() {
  const [idx, setIdx] = useState(0);
  const iframeRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % VIDEOS.length), SWITCH_MS);
    return () => clearInterval(t);
  }, []);

  function applySpeed() {
    // Set 1.5× playback rate via YouTube's JS API postMessage bridge
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [1.5] }),
      '*'
    );
  }

  const videoId = VIDEOS[idx];
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&modestbranding=1&loop=1&playlist=${videoId}&enablejsapi=1`;

  return (
    <div className="h-full w-full overflow-hidden bg-black rounded-xl">
      <iframe
        ref={iframeRef}
        key={videoId}
        src={src}
        className="w-full h-full"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen={false}
        title="ambient"
        style={{ border: 'none', display: 'block' }}
        onLoad={() => setTimeout(applySpeed, 1500)}
      />
    </div>
  );
}
