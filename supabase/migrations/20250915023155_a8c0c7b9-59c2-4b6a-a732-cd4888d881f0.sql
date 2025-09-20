-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'personal', 'business');

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'personal',
  plan_type TEXT NOT NULL DEFAULT 'personal',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id AND role = _role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create trigger function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number, role, plan_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone_number',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'personal'),
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'personal')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for existing tables to support admin access
-- Update bank_accounts policies
DROP POLICY IF EXISTS "Users can view their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can view their own bank accounts" 
ON public.bank_accounts FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can create their own bank accounts" 
ON public.bank_accounts FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can update their own bank accounts" 
ON public.bank_accounts FOR UPDATE 
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can delete their own bank accounts" 
ON public.bank_accounts FOR DELETE 
USING (auth.uid() = user_id OR public.is_admin());

-- Update category_goals policies
DROP POLICY IF EXISTS "Users can view their own category goals" ON public.category_goals;
CREATE POLICY "Users can view their own category goals" 
ON public.category_goals FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own category goals" ON public.category_goals;
CREATE POLICY "Users can create their own category goals" 
ON public.category_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own category goals" ON public.category_goals;
CREATE POLICY "Users can update their own category goals" 
ON public.category_goals FOR UPDATE 
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own category goals" ON public.category_goals;
CREATE POLICY "Users can delete their own category goals" 
ON public.category_goals FOR DELETE 
USING (auth.uid() = user_id OR public.is_admin());

-- Add trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();