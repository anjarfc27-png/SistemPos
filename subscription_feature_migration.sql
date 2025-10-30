-- ============================================
-- SUBSCRIPTION FEATURE MIGRATION
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Add subscription fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_end timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free', 'trial', 'basic', 'premium', 'enterprise')),
  ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS whatsapp text;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end ON public.profiles(subscription_end);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active DESC);

-- 3. Create function to check if subscription is expired
CREATE OR REPLACE FUNCTION public.is_subscription_expired(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN subscription_end IS NULL THEN false
      WHEN subscription_end < now() THEN true
      ELSE false
    END
  FROM public.profiles
  WHERE user_id = user_id_param;
$$;

-- 4. Create function to update last_active timestamp
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_active = now()
  WHERE user_id = auth.uid();
  RETURN NEW;
END;
$$;

-- 5. Add RLS policy to block expired subscriptions
CREATE POLICY "Block expired subscriptions"
  ON public.profiles
  FOR SELECT
  USING (
    subscription_end IS NULL OR 
    subscription_end >= now() OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = profiles.user_id 
      AND user_roles.role = 'admin'
    )
  );

-- 6. Create function to get subscription info
CREATE OR REPLACE FUNCTION public.get_subscription_info(user_id_param uuid)
RETURNS TABLE (
  subscription_end timestamptz,
  subscription_plan text,
  last_active timestamptz,
  whatsapp text,
  is_expired boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.subscription_end,
    p.subscription_plan,
    p.last_active,
    p.whatsapp,
    CASE 
      WHEN p.subscription_end IS NULL THEN false
      WHEN p.subscription_end < now() THEN true
      ELSE false
    END as is_expired
  FROM public.profiles p
  WHERE p.user_id = user_id_param;
$$;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_subscription_expired TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_info TO authenticated;

-- 8. Comment on new columns
COMMENT ON COLUMN public.profiles.subscription_end IS 'Tanggal berakhirnya subscription';
COMMENT ON COLUMN public.profiles.subscription_plan IS 'Jenis plan subscription: free, trial, basic, premium, enterprise';
COMMENT ON COLUMN public.profiles.last_active IS 'Terakhir kali user aktif/login';
COMMENT ON COLUMN public.profiles.whatsapp IS 'Nomor WhatsApp user (format: 628xxxxxxxxxx)';
