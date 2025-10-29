# Database Migrations

## Feedbacks Table Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Create feedbacks table for user feedback and suggestions
create table if not exists public.feedbacks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  subject text not null,
  message text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.feedbacks enable row level security;

-- Users can insert their own feedback
create policy "Users can insert their own feedback"
  on public.feedbacks for insert
  with check (auth.uid() = user_id);

-- Users can view their own feedback
create policy "Users can view their own feedback"
  on public.feedbacks for select
  using (auth.uid() = user_id);

-- Admins can view all feedback
create policy "Admins can view all feedback"
  on public.feedbacks for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admins can update feedback status
create policy "Admins can update feedback"
  on public.feedbacks for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Add indexes for performance
create index if not exists feedbacks_user_id_idx on public.feedbacks(user_id);
create index if not exists feedbacks_status_idx on public.feedbacks(status);
create index if not exists feedbacks_created_at_idx on public.feedbacks(created_at desc);

-- Add subscription_end and last_seen to profiles table if they don't exist
alter table public.profiles 
  add column if not exists subscription_end timestamp with time zone,
  add column if not exists last_seen timestamp with time zone default timezone('utc'::text, now());

-- Add index for last_seen
create index if not exists profiles_last_seen_idx on public.profiles(last_seen desc);
```

After running the migration, update the Supabase types by going to the Lovable Cloud tab and clicking "Regenerate types".
