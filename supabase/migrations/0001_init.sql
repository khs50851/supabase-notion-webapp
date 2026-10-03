-- 견적서 웹 확인 서비스 초기 스키마 (accounts / quotes / quote_items)
-- Supabase SQL Editor 또는 `supabase db push`로 적용

-- 1) accounts: auth.users를 1:1 확장하는 관리자 프로필
-- 비밀번호는 Supabase Auth(auth.users)가 관리하므로 별도 컬럼 없음
create table if not exists public.accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  notion_api_key text,
  notion_database_id text,
  created_at timestamptz not null default now()
);

-- 2) quotes: 노션 견적서 캐시
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  notion_page_id text not null,
  -- quote_number/status/valid_until은 노션 invoice DB의 선택 프로퍼티라 nullable
  quote_number text,
  client_name text not null,
  total_amount numeric not null default 0,
  issued_date date not null,
  valid_until date,
  status text,
  share_token text unique,
  constraint quotes_account_notion_page_unique unique (account_id, notion_page_id)
);

create index if not exists quotes_account_id_idx on public.quotes (account_id);
create index if not exists quotes_share_token_idx on public.quotes (share_token);

-- 3) quote_items: 견적 항목
create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  item_name text not null,
  quantity numeric not null default 0,
  unit_price numeric not null default 0
);

create index if not exists quote_items_quote_id_idx on public.quote_items (quote_id);

-- 4) auth.users 신규 가입 시 accounts 행 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.accounts (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) RLS 활성화
alter table public.accounts enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

-- accounts: 본인 행만 조회/수정 가능
create policy "accounts_select_own" on public.accounts
  for select using (auth.uid() = id);

create policy "accounts_update_own" on public.accounts
  for update using (auth.uid() = id);

-- quotes: 소유 관리자만 CRUD
-- 주의: 공개 견적서 조회(F003)는 이 RLS를 우회하지 않고
-- lib/supabase/admin.ts의 서비스 롤 클라이언트로 share_token 조건 조회를 사용한다.
create policy "quotes_select_own" on public.quotes
  for select using (auth.uid() = account_id);

create policy "quotes_insert_own" on public.quotes
  for insert with check (auth.uid() = account_id);

create policy "quotes_update_own" on public.quotes
  for update using (auth.uid() = account_id);

create policy "quotes_delete_own" on public.quotes
  for delete using (auth.uid() = account_id);

-- quote_items: 소유 관리자만 CRUD (quotes 소유 여부로 판단)
create policy "quote_items_select_own" on public.quote_items
  for select using (
    exists (
      select 1 from public.quotes
      where public.quotes.id = public.quote_items.quote_id
        and public.quotes.account_id = auth.uid()
    )
  );

create policy "quote_items_insert_own" on public.quote_items
  for insert with check (
    exists (
      select 1 from public.quotes
      where public.quotes.id = public.quote_items.quote_id
        and public.quotes.account_id = auth.uid()
    )
  );

create policy "quote_items_update_own" on public.quote_items
  for update using (
    exists (
      select 1 from public.quotes
      where public.quotes.id = public.quote_items.quote_id
        and public.quotes.account_id = auth.uid()
    )
  );

create policy "quote_items_delete_own" on public.quote_items
  for delete using (
    exists (
      select 1 from public.quotes
      where public.quotes.id = public.quote_items.quote_id
        and public.quotes.account_id = auth.uid()
    )
  );
