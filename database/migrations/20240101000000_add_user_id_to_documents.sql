alter table if exists public.documents add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists documents_user_id_idx on documents(user_id);
