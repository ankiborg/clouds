-- Drop and recreate lore_archive with full schema
drop table if exists lore_archive cascade;
create table lore_archive (
  id uuid primary key default gen_random_uuid(),
  mystery_id uuid not null references mysteries(id),
  title text not null,
  summary text not null,
  full_writeup text not null default '',
  what_community_got_right text,
  what_community_got_wrong text,
  resolution_outcome text not null,
  resolved_at timestamptz not null,
  clue_count int not null default 0,
  reopened_at timestamptz,
  created_at timestamptz default now(),
  unique(mystery_id)
);
alter table lore_archive enable row level security;
create policy "Public read" on lore_archive for select using (true);

-- Drop and recreate patterns with full schema
drop table if exists patterns cascade;
create table patterns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  derived_from_mystery_ids uuid[] not null default '{}',
  confidence text not null default 'emerging',
  example_count int not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table patterns enable row level security;
create policy "Public read" on patterns for select using (true);
