# Tarefa 001: Setup do Projeto Next.js & Schema Drizzle ORM

## Contexto & Escopo
Inicializar o repositório base com Next.js (App Router), Tailwind CSS, TypeScript e configurar os schemas do PostgreSQL usando Drizzle ORM com suporte a isolamento multi-tenant.

## Arquivos a Criar / Alterar
* `src/db/schema.ts`
* `src/db/index.ts`
* `drizzle.config.ts`
* `.env.example`

## Critérios de Aceite
1. Executar `npx drizzle-kit generate` sem erros.
2. Todas as tabelas (`tenants`, `sources`, `pipelines`, `destinations`, `offers`, `offer_clicks`) devem possuir a chave `tenant_id` indexada.
3. Tabela `tenant_affiliate_credentials` configurada para armazenar tokens criptografados.
4. Passar no teste `npm run type-check`.
