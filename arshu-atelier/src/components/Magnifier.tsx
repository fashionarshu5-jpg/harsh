'use client';
import { useRef, useState } from 'react';

const ZOOM = 2.5, SIZE = 190;

/** 2.5x hover loupe: inspect mirror-work, stitch density and fabric grain. */
export default function Magnifier({ src, full, alt }: { src: string; full: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    setP({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height });
  };
  return (
    <div ref={ref} className="mag" onMouseMove={move} onMouseLeave={() => setP(null)}>
      <img src={src} alt={alt} />
      {p && (
        <div className="loupe" style={{
          width: SIZE, height: SIZE, left: p.x - SIZE / 2, top: p.y - SIZE / 2, backgroundImage: `url(${full})`,
          backgroundSize: `${p.w * ZOOM}px ${p.h * ZOOM}px`,
          backgroundPosition: `${-(p.x * ZOOM - SIZE / 2)}px ${-(p.y * ZOOM - SIZE / 2)}px`,
        }} />
      )}
    </div>
  );
}
