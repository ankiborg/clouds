-- Recreate votes table with correct schema (voter_fingerprint, vote_type).
-- Safe to run even if migration 003 already ran — no real vote data is lost.
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
create policy "public read votes"   on votes for select using (true);
grant select, insert on votes to anon, authenticated;

-- Atomic vote function. SECURITY DEFINER lets it UPDATE clues without an
-- explicit UPDATE RLS policy on that table (anon key alone can't do this).
create or replace function increment_vote(
  p_clue_id        uuid,
  p_vote_type      text,
  p_voter_fingerprint text
) returns table(was_duplicate bool, confidence_pct int, vote_count_real int, vote_count_stretch int)
language plpgsql security definer as $$
declare
  v_real       int;
  v_stretch    int;
  v_confidence int;
  v_rows       int;
begin
  insert into votes (clue_id, vote_type, voter_fingerprint)
  values (p_clue_id, p_vote_type, p_voter_fingerprint)
  on conflict (clue_id, voter_fingerprint) do nothing;

  get diagnostics v_rows = row_count;

  if v_rows = 0 then
    -- duplicate: return current counts unchanged
    select clues.confidence_pct, clues.vote_count_real, clues.vote_count_stretch
      into v_confidence, v_real, v_stretch
      from clues where id = p_clue_id;
    return query select true, v_confidence, v_real, v_stretch;
    return;
  end if;

  -- Increment the right counter
  if p_vote_type = 'real' then
    update clues set vote_count_real    = vote_count_real    + 1 where id = p_clue_id;
  else
    update clues set vote_count_stretch = vote_count_stretch + 1 where id = p_clue_id;
  end if;

  select vote_count_real, vote_count_stretch
    into v_real, v_stretch
    from clues where id = p_clue_id;

  v_confidence := case
    when (v_real + v_stretch) > 0
    then round(v_real::float / (v_real + v_stretch) * 100)::int
    else 50
  end;

  -- Update confidence and promote speculated → corroborated if threshold met
  update clues
    set confidence_pct = v_confidence,
        status = case
          when status = 'speculated'
           and v_confidence >= 75
           and (v_real + v_stretch) >= 10
          then 'corroborated'
          else status
        end
    where id = p_clue_id;

  return query select false, v_confidence, v_real, v_stretch;
end;
$$;

grant execute on function increment_vote(uuid, text, text) to anon;
