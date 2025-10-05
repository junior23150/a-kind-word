-- Adicionar campo de imagem de capa aos objetivos
ALTER TABLE public.savings_goals 
ADD COLUMN cover_image TEXT;