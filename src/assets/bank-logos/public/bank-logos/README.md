# Logos dos Bancos

Esta pasta contém os logos dos bancos em formato PNG.

## Arquivos Necessários:

- `nubank.png` - Logo do Nubank
- `santander.png` - Logo do Santander  
- `itau.png` - Logo do Itaú
- `banco-do-brasil.png` - Logo do Banco do Brasil
- `caixa.png` - Logo da Caixa Econômica Federal
- `sicredi.png` - Logo do Sicredi
- `sicoob.png` - Logo do Sicoob
- `bradesco.png` - Logo do Bradesco
- `inter.png` - Logo do Banco Inter
- `outros.png` - Logo genérico para outros bancos

## Especificações:

- **Formato:** PNG com fundo transparente (recomendado)
- **Tamanho:** Mínimo 64x64px, recomendado 128x128px
- **Qualidade:** Alta resolução para diferentes tamanhos de tela
- **Formato:** Quadrado (1:1) para melhor encaixe no círculo

## Como Funciona:

1. O componente `BankLogo` tenta carregar a imagem correspondente
2. Se a imagem não existir ou falhar ao carregar, mostra um fallback com:
   - Cor de fundo oficial do banco
   - Iniciais do banco em branco
3. Para "Outros", mostra ícone genérico de banco

## Fallback Atual:

Enquanto as imagens não forem adicionadas, o sistema mostra as iniciais dos bancos com as cores oficiais.
