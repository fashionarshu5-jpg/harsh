import ContactForm from '@/components/ContactForm';
import { getSettings } from '@/lib/settings';

export default async function Contact() {
  const s = await getSettings();
  return (
    <div className="wrap sec cols">
      <div>
        <p className="eyebrow">Couture appointments</p><h1 style={{ fontSize: 'clamp(44px,6vw,72px)', margin: '8px 0 24px' }}>Contact</h1>
        <p>{s.socialLinks.atelier_location || 'Atelier, Surat, Gujarat'}</p>
        {s.socialLinks.phone && <p>{s.socialLinks.phone}</p>}
        {s.contactEmail && <p>{s.contactEmail}</p>}
        {s.socialLinks.instagram_url && <p><a href={s.socialLinks.instagram_url} style={{ borderBottom: '1px solid' }}>Instagram {s.contactInstagram}</a></p>}
      </div>
      <ContactForm />
    </div>
  );
}
