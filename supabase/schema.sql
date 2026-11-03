create table if not exists public.favorites (
  user_id    uuid   not null default auth.uid() references auth.users(id) on delete cascade,
  game_id    bigint not null,
  game       jsonb  not null,
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create table if not exists public.consumed (
  user_id    uuid   not null default auth.uid() references auth.users(id) on delete cascade,
  game_id    bigint not null,
  game       jsonb  not null,
  rating     smallint check (rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

alter table public.favorites enable row level security;
alter table public.consumed  enable row level security;

create policy "favorites_own" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "consumed_own" on public.consumed
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
