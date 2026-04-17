create table observations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  content text not null,
  sources text[],
  run_id text,
  vault_page_count int,
  model_used text default 'claude-sonnet-4-5'
);

create index on observations (created_at desc);
