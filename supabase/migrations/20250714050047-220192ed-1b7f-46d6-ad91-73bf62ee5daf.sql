-- Create clients table to manage different clients/companies
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#22c55e',
  secondary_color TEXT DEFAULT '#8b5cf6',
  whatsapp_phone_number_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients
CREATE POLICY "Clients are viewable by everyone" 
ON public.clients 
FOR SELECT 
USING (true);

-- Add client_id to whatsapp_users table
ALTER TABLE public.whatsapp_users 
ADD COLUMN client_id UUID REFERENCES public.clients(id),
ADD COLUMN is_registered BOOLEAN DEFAULT false;

-- Add client_id to transactions table
ALTER TABLE public.transactions 
ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Add client_id to whatsapp_conversations table
ALTER TABLE public.whatsapp_conversations 
ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Create trigger for clients updated_at
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default client (Knumbers)
INSERT INTO public.clients (name, slug, primary_color, secondary_color, whatsapp_phone_number_id)
VALUES ('Knumbers', 'knumbers', '#22c55e', '#8b5cf6', 'default');

-- Create user profiles table for registered users
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  whatsapp_user_id UUID NOT NULL REFERENCES public.whatsapp_users(id),
  email TEXT,
  full_name TEXT,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subscription_plan TEXT DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, whatsapp_user_id)
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (true);

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();