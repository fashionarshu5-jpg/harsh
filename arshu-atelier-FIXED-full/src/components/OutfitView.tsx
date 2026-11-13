import Link from 'next/link';
import OutfitGallery from './OutfitGallery';

export default function OutfitView({ o, materials, collection }: { o: any; materials: any[]; collection?: any }) {
  const specs: [string, string][] = [
    ['Description', o.description], ['Fabric', o.fabricBreakdown], ['Embroidery & craft', o.embroideryCraftDetails],
    ['Silhouette', o.silhouetteType], ['Construction & measurements', o.measurementsConstruction],
  ];
  return (
    <div className="wrap sec">
      {collection && <p className="eyebrow"><Link href={`/collections/${collection.slug}`}>← {collection.title}</Link></p>}
      <div className="cols" style={{ marginTop: 18 }}>
        <OutfitGallery images={o.images || []} video={o.videoUrl} title={o.title} />
        <div>
          <p className="eyebrow">{o.lookNumber}</p>
          <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', margin: '8px 0 20px' }}>{o.title}</h1>
          {specs.filter(([, v]) => v).map(([k, v]) => <div className="spec" key={k}><h4>{k}</h4><div style={{ whiteSpace: 'pre-line' }}>{v}</div></div>)}
          {materials.length > 0 && (
            <div className="spec"><h4>Materials in this look</h4>
              <div className="row">{materials.map((m) => (
                <Link key={m.id} href={`/materials/${m.id}`} className="chip"><span className="dot" style={{ background: m.colorHex, marginRight: 6, verticalAlign: 'middle', width: 12, height: 12 }} />{m.materialName} →</Link>
              ))}</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
