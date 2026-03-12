
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_name text,
  price_id text,
  status text, -- 'active', 'canceled', 'past_due', 'trialing'
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies
alter table public.subscriptions enable row level security;

create policy "Users can view own subscription" 
  on public.subscriptions for select 
  using (auth.uid() = user_id);

create policy "Service role can manage subscriptions" 
  on public.subscriptions for all 
  using (true);
