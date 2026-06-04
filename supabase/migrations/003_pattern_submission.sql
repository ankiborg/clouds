-- Add created_at to connections
alter table connections
  add column if not exists created_at timestamptz default now();

-- Unique constraint on connections (idempotent)
do $$ begin
  alter table connections
    add constraint connections_clue_id_a_clue_id_b_key unique (clue_id_a, clue_id_b);
exception when duplicate_table then null;
end $$;

-- Recreate votes table with voter_fingerprint (replaces voter_id / type columns)
drop table if exists votes cascade;

create table votes (
  id uuid primary key default gen_random_uuid(),
  clue_id uuid not null references clues(id) on delete cascade,
  vote_type text not null,
  voter_fingerprint text not null,
  created_at timestamptz default now(),
  unique(clue_id, voter_fingerprint)
);

alter table votes enable row level security;
create policy "public insert votes" on votes for insert with check (true);
create policy "public read votes" on votes for select using (true);

grant select, insert on votes to anon, authenticated;

-- Submissions queue (new table)
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  source_type text not null,
  source_url text,
  mystery_id uuid references mysteries(id),
  submitted_at timestamptz default now(),
  status text not null default 'pending',
  rejection_reason text,
  clue_id uuid references clues(id)
);

alter table submissions enable row level security;
create policy "public insert submissions" on submissions for insert with check (true);
create policy "public read submissions" on submissions for select using (true);

grant select, insert on submissions to anon, authenticated;

-- Drop obsolete record_vote function (votes schema changed, new vote route handles this directly)
drop function if exists record_vote(uuid, text, text);
