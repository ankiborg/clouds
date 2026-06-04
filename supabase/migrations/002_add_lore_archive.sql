create table if not exists lore_archive (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  resolution text not null,
  resolved_at timestamptz not null,
  clue_count integer default 0,
  created_at timestamptz default now()
);

alter table lore_archive enable row level security;

create policy "public read lore_archive" on lore_archive for select using (true);
