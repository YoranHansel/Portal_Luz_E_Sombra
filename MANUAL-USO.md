# Manual de Uso

## Para clientes

1. Acesse a página de login e entre com sua conta.
2. Na Home, consulte os trabalhos exibidos na seção de álbuns.
3. Acesse **Agendamento**.
4. Escolha `Casamento` ou `Gestante`.
5. Informe uma data atual ou futura e envie a solicitação.
6. Aguarde a confirmação da fotógrafa pelos canais definidos pelo estúdio.

## Para a fotógrafa

1. Crie a tabela `agendamentos` no Supabase usando o SQL disponível no `React/README.md`.
2. Configure `React/.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Execute `npm install` e depois `npm run dev` dentro da pasta `React`.
4. Faça um cadastro de teste e confirme o email, caso a confirmação esteja ativa no Supabase.
5. Teste um agendamento com cada tipo de ensaio.
6. Consulte as solicitações no Supabase em **Table Editor > agendamentos**.

## API dos álbuns

A Home consulta `https://jsonplaceholder.typicode.com/photos?_limit=8`. Essa API é uma fonte de demonstração; para produção, substitua o endpoint por uma API ou storage com os álbuns reais do estúdio.

## Verificação rápida

- `npm run lint` verifica o código.
- `npm run build` confirma que a aplicação pode ser empacotada para publicação.
- O formulário rejeita email inválido, senhas menores que seis caracteres, senha de confirmação diferente, tipo ausente e datas anteriores ao dia atual.
