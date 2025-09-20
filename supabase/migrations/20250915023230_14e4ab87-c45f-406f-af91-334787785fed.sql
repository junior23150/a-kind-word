-- Create admin profile for current user
INSERT INTO public.profiles (id, email, full_name, role, plan_type) 
VALUES ('cc3e47ab-f6c9-47de-b377-538b6751d68d', 'aluizio.m.s.jr21@gmail.com', 'Admin User', 'admin', 'business') 
ON CONFLICT (id) DO UPDATE SET role = 'admin', plan_type = 'business';