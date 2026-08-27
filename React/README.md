# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Configuração do Supabase

Crie o arquivo `React/.env` a partir de `.env.example` e preencha as credenciais do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

Reinicie o servidor de desenvolvimento depois de criar ou alterar o arquivo `.env`.

## Funcionalidades

- A Home carrega os álbuns pela API pública JSONPlaceholder.
- O agendamento usa `clientes`, `tipos_ensaio` e `agendamentos`.
- Cada solicitação é vinculada ao cliente pelo email da conta autenticada.

Insira os tipos de ensaio e habilite estas policies no editor SQL do Supabase:

```sql
insert into public.tipos_ensaio (nome, descricao)
select 'Casamento', 'Registro de celebrações e histórias a dois.'
where not exists (select 1 from public.tipos_ensaio where lower(nome) = 'casamento');

insert into public.tipos_ensaio (nome, descricao)
select 'Gestante', 'Ensaios delicados para celebrar a espera.'
where not exists (select 1 from public.tipos_ensaio where lower(nome) = 'gestante');

alter table public.clientes enable row level security;
alter table public.tipos_ensaio enable row level security;
alter table public.agendamentos enable row level security;

drop policy if exists "Clientes podem consultar o próprio cadastro" on public.clientes;
create policy "Clientes podem consultar o próprio cadastro"
on public.clientes for select to authenticated
using (lower(trim(email)) = lower(trim((select auth.jwt() ->> 'email'))));

drop policy if exists "Clientes podem criar o próprio cadastro" on public.clientes;
create policy "Clientes podem criar o próprio cadastro"
on public.clientes for insert to authenticated
with check (lower(trim(email)) = lower(trim((select auth.jwt() ->> 'email'))));

drop policy if exists "Usuários autenticados podem consultar tipos" on public.tipos_ensaio;
create policy "Usuários autenticados podem consultar tipos"
on public.tipos_ensaio for select to authenticated
using (true);

drop policy if exists "Clientes podem consultar seus agendamentos" on public.agendamentos;
create policy "Clientes podem consultar seus agendamentos"
on public.agendamentos for select to authenticated
using (exists (
	select 1 from public.clientes
	where clientes.id = agendamentos.cliente_id
		and lower(trim(clientes.email)) = lower(trim((select auth.jwt() ->> 'email')))
));

drop policy if exists "Clientes podem criar seus agendamentos" on public.agendamentos;
create policy "Clientes podem criar seus agendamentos"
on public.agendamentos for insert to authenticated
with check (exists (
	select 1 from public.clientes
	where clientes.id = agendamentos.cliente_id
		and lower(trim(clientes.email)) = lower(trim((select auth.jwt() ->> 'email')))
));
```
