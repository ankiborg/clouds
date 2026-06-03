create table if not exists raw_events (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_url text,
  raw_content text not null,
  raw_metadata jsonb,
  spotted_at timestamptz not null,
  processed boolean default false,
  created_at timestamptz default now()
);

create index if not exists raw_events_processed_idx on raw_events(processed);

create table if not exists agent_state (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);
