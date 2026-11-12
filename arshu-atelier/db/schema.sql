-- Paste this whole file into Neon > SQL Editor and press Run. It is safe to run twice.
create table if not exists site_settings (
  id serial primary key,
  brand_name text not null default 'ARSHU',
  primary_ivory text not null default '#F9F8F6',
  surface_stone text not null default '#F2EFE9',
  accent_charcoal text not null default '#1A1A1A',
  accent_gold text not null default '#C5A880',
  accent_terracotta text not null default '#D97443',
  font_heading text not null default 'Cormorant Garamond',
  font_body text not null default 'Plus Jakarta Sans',
  about_editorial text not null default '',
  contact_email text not null default '',
  contact_instagram text not null default '',
  social_links jsonb not null default '{}',
  home_content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
insert into site_settings (id) values (1) on conflict do nothing;

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null, title text not null,
  concept_description text not null default '', inspiration_story text not null default '',
  color_palette jsonb not null default '[]', fabric_notes text not null default '',
  silhouette_notes text not null default '', hero_image_url text not null default '',
  sort_order integer not null default 0, status text not null default 'draft',
  created_at timestamptz not null default now()
);
create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references collections(id) on delete cascade,
  slug text not null, look_number text not null default 'Look 01', title text not null,
  description text not null default '', fabric_breakdown text not null default '',
  embroidery_craft_details text not null default '', silhouette_type text not null default '',
  measurements_construction text not null default '', images jsonb not null default '[]',
  video_url text not null default '', material_archive_ids jsonb not null default '[]',
  status text not null default 'draft', created_at timestamptz not null default now()
);
create table if not exists material_archive (
  id uuid primary key default gen_random_uuid(),
  material_name text not null, material_type text not null default '',
  texture_description text not null default '', embroidery_craft_technique text not null default '',
  color_hex text not null default '#C5A880', swatch_image_url text not null default '',
  usage_notes text not null default '', created_at timestamptz not null default now()
);
create table if not exists moodboards (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references collections(id) on delete set null,
  slug text not null, title text not null, cultural_roots text not null default '',
  color_story jsonb not null default '[]', "references" jsonb not null default '[]',
  layout_type text not null default 'masonry', status text not null default 'draft',
  created_at timestamptz not null default now()
);
create table if not exists sketches (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references collections(id) on delete set null,
  title text not null, illustration_url text not null default '',
  technical_flat_front_url text not null default '', technical_flat_back_url text not null default '',
  hotspot_pins jsonb not null default '[]', spec_sheet_pdf_url text not null default '',
  status text not null default 'draft', created_at timestamptz not null default now()
);
create table if not exists ai_research_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null, category text not null default '', region text not null default 'Worldwide',
  designer_or_brand text not null default '', event_date text not null default '',
  summary text not null default '', importance text not null default '', arshu_inspiration text not null default '',
  creative_direction jsonb not null default '{"fabrics":[],"colors":[],"silhouettes":[],"craft":[]}',
  source_links jsonb not null default '[]', image_urls jsonb not null default '[]',
  is_saved boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists pending_approvals (
  id uuid primary key default gen_random_uuid(),
  module_target text not null, target_id uuid, suggested_payload jsonb not null default '{}',
  status text not null default 'pending', created_at timestamptz not null default now(), reviewed_at timestamptz
);
create table if not exists admin_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null, message text not null default '', type text not null default 'system',
  is_read boolean not null default false, created_at timestamptz not null default now()
);
