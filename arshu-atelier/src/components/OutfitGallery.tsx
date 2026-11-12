'use client';
import { useState } from 'react';
import Magnifier from './Magnifier';
import { opt } from '@/lib/util';

export default function OutfitGallery({ images, video, title }: { images: { url: string; angle: string }[]; video: string; title: string }) {
  const [i, setI] = useState(0);
  const cur = images[i];
  return (
    <div>
      {cur ? <Magnifier src={opt(cur.url)} full={opt(cur.url, 'f_auto,q_auto,w_2800')} alt={`${title} – ${cur.angle}`} /> : <div className="tile"><div className="ph" /></div>}
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((im, k) => (
            <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={im.angle}>
              <img src={opt(im.url, 'f_auto,q_auto,w_200')} alt={im.angle} /><small>{im.angle}</small>
            </button>
          ))}
        </div>
      )}
      <p className="muted" style={{ fontSize: 13 }}>Hover over the image to inspect the craft at 2.5× zoom.</p>
      {video && <video controls playsInline preload="metadata" src={video} style={{ width: '100%', marginTop: 16 }} />}
    </div>
  );
}
