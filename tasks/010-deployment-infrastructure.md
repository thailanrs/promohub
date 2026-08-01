# Tarefa 010: Infraestrutura, Docker & Guia de Deploy (Oracle VPS + Vercel + Supabase)

## Contexto & Escopo
Configurar a infraestrutura de produção híbrida e sem custos fixos iniciais:
1. **Supabase:** Banco de dados PostgreSQL gerenciado (Connection Pooler).
2. **Vercel:** Hospedagem da aplicação PWA Next.js, App Router e Web Share Target API.
3. **Oracle Cloud VPS:** Container Docker executando Redis (BullMQ), os Workers de background e a instância do WhatsApp (Baileys) rodando 24/7 de graça no *Always Free Tier*.

## Arquivos a Criar / Alterar
* `public/manifest.json`
* `Dockerfile.worker`
* `docker-compose.yml`
* `.env.production.example`
* `docs/DEPLOYMENT_GUIDE.md`
* `tasks/010-deployment-infrastructure.md`

## Critérios de Aceite
1. Manifesto PWA configurado com suporte à Web Share Target API redirecionando para `/api/ingest/share-target`.
2. `Dockerfile.worker` multi-stage otimizado para o processo de Workers do BullMQ/Redis e Baileys.
3. `docker-compose.yml` contendo os serviços `redis` (com volume persistente) e `promohub-worker` com política `restart: always`.
4. Mapeamento completo de variáveis de ambiente em `.env.production.example`.
5. Guia passo a passo de deploy documentado em `docs/DEPLOYMENT_GUIDE.md` cobrindo Supabase, Oracle VPS e Vercel.
