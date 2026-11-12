export type Field = {
  key: string; label: string; hint?: string; options?: string[];
  type: 'text' | 'textarea' | 'number' | 'color' | 'select' | 'image' | 'images' | 'refs' | 'hotspots' |
    'colors' | 'collection' | 'materials' | 'pdf' | 'video';
};
export type Resource = { title: string; singular: string; titleKey: string; hasStatus: boolean; fields: Field[] };
const status: Field = { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] };

export const RESOURCES: Record<string, Resource> = {
  collections: {
    title: 'Collections', singular: 'collection', titleKey: 'title', hasStatus: true,
    fields: [
      { key: 'title', label: 'Title', type: 'text' }, { key: 'slug', label: 'URL slug (auto if empty)', type: 'text' },
      { key: 'conceptDescription', label: 'Concept description', type: 'textarea' },
      { key: 'inspirationStory', label: 'Inspiration story ("Behind the Scenes")', type: 'textarea' },
      { key: 'colorPalette', label: 'Colour palette', type: 'colors', hint: 'Comma separated hex codes, e.g. #D97443, #C5A880' },
      { key: 'fabricNotes', label: 'Fabric notes', type: 'textarea' }, { key: 'silhouetteNotes', label: 'Silhouette notes', type: 'textarea' },
      { key: 'heroImageUrl', label: 'Cover image', type: 'image' }, { key: 'sortOrder', label: 'Sort order (0 = first)', type: 'number' }, status,
    ],
  },
  outfits: {
    title: 'Outfits (Looks)', singular: 'look', titleKey: 'title', hasStatus: true,
    fields: [
      { key: 'collectionId', label: 'Collection', type: 'collection' },
      { key: 'lookNumber', label: 'Look number', type: 'text', hint: 'e.g. Look 01' },
      { key: 'title', label: 'Title', type: 'text' }, { key: 'slug', label: 'URL slug (auto if empty)', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' }, { key: 'fabricBreakdown', label: 'Fabric breakdown', type: 'textarea' },
      { key: 'embroideryCraftDetails', label: 'Embroidery & craft details', type: 'textarea' },
      { key: 'silhouetteType', label: 'Silhouette type', type: 'text' },
      { key: 'measurementsConstruction', label: 'Measurements & construction', type: 'textarea' },
      { key: 'images', label: 'Images (front, back, silhouette, detail)', type: 'images' },
      { key: 'videoUrl', label: 'Video clip (MP4)', type: 'video' },
      { key: 'materialArchiveIds', label: 'Linked materials', type: 'materials' }, status,
    ],
  },
  materials: {
    title: 'Material Archive', singular: 'material', titleKey: 'materialName', hasStatus: false,
    fields: [
      { key: 'materialName', label: 'Material name', type: 'text' }, { key: 'materialType', label: 'Type (weave / texture / craft)', type: 'text' },
      { key: 'textureDescription', label: 'Texture description', type: 'textarea' },
      { key: 'embroideryCraftTechnique', label: 'Embroidery / craft technique', type: 'textarea' },
      { key: 'colorHex', label: 'Colour', type: 'color' }, { key: 'swatchImageUrl', label: 'Swatch image', type: 'image' },
      { key: 'usageNotes', label: 'Usage notes', type: 'textarea' },
    ],
  },
  moodboards: {
    title: 'Moodboards', singular: 'moodboard', titleKey: 'title', hasStatus: true,
    fields: [
      { key: 'collectionId', label: 'Collection (optional)', type: 'collection' },
      { key: 'title', label: 'Title', type: 'text' }, { key: 'slug', label: 'URL slug (auto if empty)', type: 'text' },
      { key: 'culturalRoots', label: 'Cultural roots', type: 'textarea' },
      { key: 'colorStory', label: 'Colour story', type: 'colors', hint: 'Comma separated hex codes' },
      { key: 'references', label: 'Reference images', type: 'refs' },
      { key: 'layoutType', label: 'Layout', type: 'select', options: ['masonry', 'editorial_overlap'] }, status,
    ],
  },
  sketches: {
    title: 'Sketches & Flats', singular: 'sketch', titleKey: 'title', hasStatus: true,
    fields: [
      { key: 'collectionId', label: 'Collection (optional)', type: 'collection' }, { key: 'title', label: 'Title', type: 'text' },
      { key: 'illustrationUrl', label: '12-head croquis illustration', type: 'image' },
      { key: 'technicalFlatFrontUrl', label: 'Technical flat – front', type: 'image' },
      { key: 'technicalFlatBackUrl', label: 'Technical flat – back', type: 'image' },
      { key: 'hotspotPins', label: 'Hotspot pins (click on the front flat)', type: 'hotspots' },
      { key: 'specSheetPdfUrl', label: 'Tailor spec sheet (PDF)', type: 'pdf' }, status,
    ],
  },
};

export const RESEARCH_CATEGORIES = [
  'Fashion Shows & Runway Collections', 'Indo-Western Fashion Trends', 'Fabrics, Colours & Silhouettes',
  'Luxury Designer Brands', 'Fashion Exhibitions & Events', 'Celebrity & Designer Inspiration',
  'Fashion Technology & Innovation', 'Fashion Business & Emerging Designers',
];
export const HEADING_FONTS = ['Cormorant Garamond', 'Playfair Display', 'EB Garamond', 'Cormorant'];
export const BODY_FONTS = ['Plus Jakarta Sans', 'Inter', 'DM Sans', 'Manrope'];
