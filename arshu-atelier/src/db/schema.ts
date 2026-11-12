import { pgTable, uuid, text, jsonb, timestamp, boolean, integer, serial } from 'drizzle-orm/pg-core';

export type HomeContent = Partial<Record<
  'eyebrow' | 'headline1' | 'headline2' | 'subtext' | 'buttonLabel' | 'buttonLink' | 'location' | 'heroImage' |
  'collectionsLabel' | 'collectionsHeading1' | 'collectionsHeading2' | 'collectionsTagline' | 'collectionsLink' |
  'headerButton' | 'brandTagline', string>>;
export type ImageItem = { url: string; angle: string };
export type Pin = { x: number; y: number; label: string; spec: string };
export type Ref = { url: string; caption: string; tags: string[] };
export type SourceLink = { title: string; url: string };

const created = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull();
const status = () => text('status').$type<'draft' | 'published'>().notNull().default('draft');

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  brandName: text('brand_name').notNull().default('ARSHU'),
  primaryIvory: text('primary_ivory').notNull().default('#F9F8F6'),
  surfaceStone: text('surface_stone').notNull().default('#F2EFE9'),
  accentCharcoal: text('accent_charcoal').notNull().default('#1A1A1A'),
  accentGold: text('accent_gold').notNull().default('#C5A880'),
  accentTerracotta: text('accent_terracotta').notNull().default('#D97443'),
  fontHeading: text('font_heading').notNull().default('Cormorant Garamond'),
  fontBody: text('font_body').notNull().default('Plus Jakarta Sans'),
  aboutEditorial: text('about_editorial').notNull().default(''),
  contactEmail: text('contact_email').notNull().default(''),
  contactInstagram: text('contact_instagram').notNull().default(''),
  socialLinks: jsonb('social_links').$type<Record<string, string>>().notNull().default({}),
  homeContent: jsonb('home_content').$type<HomeContent>().notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  conceptDescription: text('concept_description').notNull().default(''),
  inspirationStory: text('inspiration_story').notNull().default(''),
  colorPalette: jsonb('color_palette').$type<string[]>().notNull().default([]),
  fabricNotes: text('fabric_notes').notNull().default(''),
  silhouetteNotes: text('silhouette_notes').notNull().default(''),
  heroImageUrl: text('hero_image_url').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  status: status(),
  createdAt: created(),
});

export const outfits = pgTable('outfits', {
  id: uuid('id').defaultRandom().primaryKey(),
  collectionId: uuid('collection_id').references(() => collections.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  lookNumber: text('look_number').notNull().default('Look 01'),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  fabricBreakdown: text('fabric_breakdown').notNull().default(''),
  embroideryCraftDetails: text('embroidery_craft_details').notNull().default(''),
  silhouetteType: text('silhouette_type').notNull().default(''),
  measurementsConstruction: text('measurements_construction').notNull().default(''),
  images: jsonb('images').$type<ImageItem[]>().notNull().default([]),
  videoUrl: text('video_url').notNull().default(''),
  materialArchiveIds: jsonb('material_archive_ids').$type<string[]>().notNull().default([]),
  status: status(),
  createdAt: created(),
});

export const materialArchive = pgTable('material_archive', {
  id: uuid('id').defaultRandom().primaryKey(),
  materialName: text('material_name').notNull(),
  materialType: text('material_type').notNull().default(''),
  textureDescription: text('texture_description').notNull().default(''),
  embroideryCraftTechnique: text('embroidery_craft_technique').notNull().default(''),
  colorHex: text('color_hex').notNull().default('#C5A880'),
  swatchImageUrl: text('swatch_image_url').notNull().default(''),
  usageNotes: text('usage_notes').notNull().default(''),
  createdAt: created(),
});

export const moodboards = pgTable('moodboards', {
  id: uuid('id').defaultRandom().primaryKey(),
  collectionId: uuid('collection_id').references(() => collections.id, { onDelete: 'set null' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  culturalRoots: text('cultural_roots').notNull().default(''),
  colorStory: jsonb('color_story').$type<string[]>().notNull().default([]),
  references: jsonb('references').$type<Ref[]>().notNull().default([]),
  layoutType: text('layout_type').$type<'masonry' | 'editorial_overlap'>().notNull().default('masonry'),
  status: status(),
  createdAt: created(),
});

export const sketches = pgTable('sketches', {
  id: uuid('id').defaultRandom().primaryKey(),
  collectionId: uuid('collection_id').references(() => collections.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  illustrationUrl: text('illustration_url').notNull().default(''),
  technicalFlatFrontUrl: text('technical_flat_front_url').notNull().default(''),
  technicalFlatBackUrl: text('technical_flat_back_url').notNull().default(''),
  hotspotPins: jsonb('hotspot_pins').$type<Pin[]>().notNull().default([]),
  specSheetPdfUrl: text('spec_sheet_pdf_url').notNull().default(''),
  status: status(),
  createdAt: created(),
});

export const aiResearchEntries = pgTable('ai_research_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull().default(''),
  region: text('region').notNull().default('Worldwide'),
  designerOrBrand: text('designer_or_brand').notNull().default(''),
  eventDate: text('event_date').notNull().default(''),
  summary: text('summary').notNull().default(''),
  importance: text('importance').notNull().default(''),
  arshuInspiration: text('arshu_inspiration').notNull().default(''),
  creativeDirection: jsonb('creative_direction')
    .$type<{ fabrics: string[]; colors: string[]; silhouettes: string[]; craft: string[] }>()
    .notNull().default({ fabrics: [], colors: [], silhouettes: [], craft: [] }),
  sourceLinks: jsonb('source_links').$type<SourceLink[]>().notNull().default([]),
  imageUrls: jsonb('image_urls').$type<string[]>().notNull().default([]),
  isSaved: boolean('is_saved').notNull().default(false),
  createdAt: created(),
});

export const pendingApprovals = pgTable('pending_approvals', {
  id: uuid('id').defaultRandom().primaryKey(),
  moduleTarget: text('module_target').$type<'collection' | 'moodboard' | 'material' | 'settings'>().notNull(),
  targetId: uuid('target_id'),
  suggestedPayload: jsonb('suggested_payload').$type<Record<string, any>>().notNull().default({}),
  status: text('status').$type<'pending' | 'approved' | 'rejected'>().notNull().default('pending'),
  createdAt: created(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
});

export const adminNotifications = pgTable('admin_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull().default(''),
  type: text('type').$type<'research_done' | 'approval_needed' | 'system'>().notNull().default('system'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: created(),
});
