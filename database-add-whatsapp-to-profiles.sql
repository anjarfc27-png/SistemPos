-- Add whatsapp_number column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.profiles.whatsapp_number IS 'User WhatsApp number for contact';

-- Update trigger function to include whatsapp_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username, whatsapp_number, is_approved)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'whatsapp_number',
    false
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    whatsapp_number = EXCLUDED.whatsapp_number;
  RETURN new;
END;
$$;
