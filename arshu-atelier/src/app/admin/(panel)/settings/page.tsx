import SettingsPanel from '@/components/SettingsPanel';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function Settings() {
  const s = await getSettings();
  return <><h1 style={{ fontSize: 38 }}>Website Customization</h1><SettingsPanel initial={JSON.parse(JSON.stringify(s))} /></>;
}
