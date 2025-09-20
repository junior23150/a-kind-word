-- Atualizar números de telefone existentes para incluir o + 
UPDATE whatsapp_users 
SET phone_number = '+' || phone_number 
WHERE phone_number NOT LIKE '+%';