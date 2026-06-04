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

-- PostgREST requires grants to anon/authenticated to register tables as routes
grant select, insert on raw_events to anon, authenticated;
grant select, insert, update on agent_state to anon, authenticated;
