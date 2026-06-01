-- SwiftWatch schema
-- Run this in the Supabase SQL editor

create table mysteries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  status text not null default 'active',
  opened_at timestamptz not null default now(),
  resolves_at timestamptz,
  resolved_at timestamptz,
  resolution_outcome text,
  clue_count integer default 0,
  vote_count integer default 0,
  agent_briefing text
);

create table clues (
  id uuid primary key default gen_random_uuid(),
  mystery_id uuid references mysteries(id),
  text text not null,
  clue_types text[] not null default '{}',
  status text not null default 'speculated',
  spotted_at timestamptz not null,
  linked_at timestamptz,
  source_url text,
  source_type text not null,
  source_name text not null,
  submitted_by text,
  is_retroactive boolean default false,
  confidence_pct integer default 50,
  vote_count_real integer default 0,
  vote_count_stretch integer default 0,
  created_at timestamptz default now()
);

create table connections (
  id uuid primary key default gen_random_uuid(),
  clue_id_a uuid references clues(id),
  clue_id_b uuid references clues(id),
  connection_reason text,
  strength_score real default 0.5
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  clue_id uuid references clues(id) not null,
  type text not null,
  voter_id text not null,
  created_at timestamptz default now(),
  unique(clue_id, voter_id)
);

create table patterns (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz default now()
);

create table glossary_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  definition text not null
);

-- Row Level Security
alter table mysteries enable row level security;
alter table clues enable row level security;
alter table connections enable row level security;
alter table votes enable row level security;
alter table patterns enable row level security;
alter table glossary_terms enable row level security;

create policy "public read mysteries" on mysteries for select using (true);
create policy "public read clues" on clues for select using (true);
create policy "public read connections" on connections for select using (true);
create policy "public read patterns" on patterns for select using (true);
create policy "public read glossary_terms" on glossary_terms for select using (true);
create policy "public insert votes" on votes for insert with check (true);
create policy "public read votes" on votes for select using (true);

-- Realtime (enables INSERT broadcasts on the clues table for LiveFeed)
alter publication supabase_realtime add table clues;

-- Atomic vote function: inserts vote + updates clue counts in one transaction
create or replace function record_vote(
  p_clue_id uuid,
  p_type text,
  p_voter_id text
) returns table(confidence_pct int, vote_count_real int, vote_count_stretch int)
language plpgsql security definer as $$
declare
  v_real int;
  v_stretch int;
  v_confidence int;
begin
  insert into votes (clue_id, type, voter_id)
  values (p_clue_id, p_type, p_voter_id)
  on conflict (clue_id, voter_id) do nothing;

  select
    count(*) filter (where type = 'real'),
    count(*) filter (where type = 'stretch')
  into v_real, v_stretch
  from votes
  where clue_id = p_clue_id;

  v_confidence := case
    when (v_real + v_stretch) > 0
    then round(v_real::float / (v_real + v_stretch) * 100)::int
    else 50
  end;

  update clues
  set
    vote_count_real = v_real,
    vote_count_stretch = v_stretch,
    confidence_pct = v_confidence
  where id = p_clue_id;

  return query select v_confidence, v_real, v_stretch;
end;
$$;

grant execute on function record_vote(uuid, text, text) to anon;
