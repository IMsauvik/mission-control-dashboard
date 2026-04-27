import { useState, useEffect } from 'react';

const VIDEOS = [
  'x8ACsWl36L8',
  'UeHQa6rs3Z4',
  'jwfpKhZwV58',
  'hiIbNaA_qao',
  'n6DBcYJ8wqY',
  'tRdPPgPrQ5U',
];

const SWITCH_MS = 10 * 60 * 1000; // rotate every 10 minutes

export default function VideoCard() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % VIDEOS.length), SWITCH_MS);
    return () => clearInterval(t);
  }, []);

  const videoId = VIDEOS[idx];
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&playlist=${videoId}&controls=0&rel=0&playsinline=1&modestbranding=1`;

  return (
    <div className="card-glass rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-none border-b border-[#1a2d45]">
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#94a3b8]">
          Imeco Products
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#64748b] font-medium">
            {idx + 1}/{VIDEOS.length}
          </span>
          <span className="text-[10px] font-bold text-[#64748b] px-1.5 py-0.5 rounded border border-[#1a2d45]">
            🔇 MUTED
          </span>
        </div>
      </div>

      {/* Video */}
      <div className="flex-1 relative bg-black">
        <iframe
          key={videoId}
          src={src}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen={false}
          title="ambient-loop"
          style={{ border: 'none' }}
        />
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 py-1.5 flex-none">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width:  i === idx ? 16 : 6,
              height: 6,
              background: i === idx ? '#22c55e' : '#1a2d45',
            }}
          />
        ))}
      </div>
    </div>
  );
}
