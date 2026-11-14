import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { materialArchive } from '@/db/schema';
import { opt } from '@/lib/util';
import { safe } from '@/lib/safe';

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/.test(params.id)) return { title: 'Material' };
  const [m] = await safe(db.select().from(materialArchive).where(eq(materialArchive.id, params.id)), []);
  return { title: m ? m.materialName : 'Material' };
}

export default async function Material({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound();
  const [m] = await safe(db.select().from(materialArchive).where(eq(materialArchive.id, params.id)), []);
  if (!m) notFound();
  return (
    <div className="wrap sec cols">
      {m.swatchImageUrl ? <img src={opt(m.swatchImageUrl, 'f_auto,q_auto,w_1200')} alt={m.materialName} /> : <div style={{ aspectRatio: '1', background: m.colorHex }} />}
      <div>
        <p className="eyebrow">{m.materialType}</p><h1 style={{ fontSize: 56, margin: '8px 0 20px' }}>{m.materialName}</h1>
        {m.textureDescription && <div className="spec"><h4>Texture</h4>{m.textureDescription}</div>}
        {m.embroideryCraftTechnique && <div className="spec"><h4>Craft technique</h4>{m.embroideryCraftTechnique}</div>}
        {m.usageNotes && <div className="spec"><h4>Usage notes</h4>{m.usageNotes}</div>}
      </div>
    </div>
  );
}
