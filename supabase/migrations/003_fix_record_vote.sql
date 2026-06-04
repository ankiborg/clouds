-- Fix record_vote to increment existing clue counts rather than re-deriving
-- from the votes table. Seed data sets vote_count_real/stretch directly on
-- clues without inserting rows into votes, so a count() approach resets to 1
-- on first use.
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
  v_rows int;
begin
  insert into votes (clue_id, type, voter_id)
  values (p_clue_id, p_type, p_voter_id)
  on conflict (clue_id, voter_id) do nothing;

  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    if p_type = 'real' then
      update clues set vote_count_real = vote_count_real + 1 where id = p_clue_id;
    else
      update clues set vote_count_stretch = vote_count_stretch + 1 where id = p_clue_id;
    end if;
  end if;

  select clues.vote_count_real, clues.vote_count_stretch
    into v_real, v_stretch
    from clues where id = p_clue_id;

  v_confidence := case
    when (v_real + v_stretch) > 0
    then round(v_real::float / (v_real + v_stretch) * 100)::int
    else 50
  end;

  update clues set confidence_pct = v_confidence where id = p_clue_id;

  return query select v_confidence, v_real, v_stretch;
end;
$$;

grant execute on function record_vote(uuid, text, text) to anon;
