-- Migrate existing users from user_profiles to profiles table
-- This migration handles users who registered before the profiles table was created

-- Create profiles for auth.users that don't have profiles yet
-- using data from user_profiles and whatsapp_users

INSERT INTO public.profiles (id, email, full_name, phone_number, role, plan_type, is_active, created_at)
SELECT 
  au.id,
  COALESCE(au.email, up.email) as email,
  up.full_name,
  wu.phone_number,
  CASE 
    WHEN up.subscription_plan = 'business' THEN 'business'::user_role
    WHEN up.subscription_plan = 'personal' THEN 'personal'::user_role
    ELSE 'personal'::user_role
  END as role,
  COALESCE(up.subscription_plan, 'personal') as plan_type,
  COALESCE(up.is_active, true) as is_active,
  up.created_at
FROM auth.users au
JOIN public.user_profiles up ON up.email = au.email
JOIN public.whatsapp_users wu ON wu.id = up.whatsapp_user_id
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
