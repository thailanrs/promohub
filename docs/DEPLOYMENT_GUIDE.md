# Guia Completo de Deploy — PromoHub SaaS (Supabase + Oracle VPS + Vercel)

Este guia documenta o procedimento passo a passo para colocar a infraestrutura distribuída do **PromoHub SaaS** em produção.

---

## Arquitetura de Implantação Distribuída

```text
┌───────────────────────────────────────────────────────────────┐
│                      VERCEL FRONTEND (PWA)                    │
│  • Next.js App Router (Dashboard & Swipe Inbox)               │
│  • Web Share Target API (/api/ingest/share-target)            │
│  • Public Shortener & Analytics (< 50ms)                      │
└───────────────┬───────────────────────────────┬───────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│       SUPABASE DATABASE       │ │       ORACLE CLOUD VPS        │
│  • PostgreSQL (Multi-Tenant)  │ │  • Docker Compose Engine      │
│  • Transaction Pooler (:6543) │ │  • Redis 7 Alpine (BullMQ)    │
│  • Direct URL (:5432)         │ │  • PromoHub Worker Container  │
└───────────────────────────────┘ └───────────────────────────────┘
```

---

## Passo 1: Configuração do Banco de Dados no Supabase

1. **Criar o Projeto no Supabase:**
   - Acesse o painel do [Supabase](https://supabase.com) e crie um novo projeto PostgreSQL.
   - Selecione a região **South America (São Paulo) `sa-east-1`** para minimizar a latência.

2. **Obter as Connection Strings:**
   - Acesse **Project Settings -> Database -> Connection Strings**.
   - **Transaction Connection Pooler (Porta 6543):**
     Utilizada pelas Serverless Functions da Vercel e pelos Workers da VPS:
     ```env
     DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
     ```
   - **Direct Connection String (Porta 5432):**
     Utilizada exclusivamente para migrações do Drizzle ORM:
     ```env
     DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
     ```

3. **Executar Migrações do Banco de Dados:**
   - No ambiente local ou esteira de CI/CD:
     ```bash
     export DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
     npx drizzle-kit push
     ```

---

## Passo 2: Implantação dos Workers e Redis na Oracle Cloud VPS

1. **Instalar Docker e Docker Compose na VPS:**
   No terminal SSH da sua instância Oracle Linux ou Ubuntu 22.04 LTS:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER
   ```

2. **Clonar o Repositório e Configurar `.env`:**
   ```bash
   git clone https://github.com/your-org/promohub.git /opt/promohub
   cd /opt/promohub
   cp .env.production.example .env
   ```
   Substitua as chaves em `/opt/promohub/.env`:
   - `DATABASE_URL`: Connection string do Supabase (:6543).
   - `REDIS_URL`: `redis://redis:6379`
   - `ENCRYPTION_SECRET`: Chave secreta AES-256 de 32 caracteres gerada com `openssl rand -hex 16`.

3. **Inicializar a Orquestração Docker:**
   ```bash
   docker compose up -d --build
   ```

4. **Verificar Status e Logs dos Trabalhadores:**
   ```bash
   docker compose ps
   docker compose logs -f promohub-worker
   ```

---

## Passo 3: Deploy da Dashboard PWA na Vercel

1. **Importar Repositório na Vercel:**
   - Acesse o painel da [Vercel](https://vercel.com) e clique em **Add New Project**.
   - Selecione o repositório do PromoHub. O Vercel detectará automaticamente o framework **Next.js**.

2. **Configurar Variáveis de Ambiente no Vercel Dashboard:**
   Adicione as seguintes variáveis nas configurações do projeto:
   - `DATABASE_URL`: String do Supabase Pooler (:6543).
   - `REDIS_URL`: Endpoint Redis acessível (ex: IP público da VPS ou Upstash Redis).
   - `ENCRYPTION_SECRET`: Mesma chave AES-256 configurada na VPS.
   - `NEXT_PUBLIC_APP_URL`: Domínio final da aplicação na Vercel (ex: `https://promohub.vercel.app`).

3. **Deploy e Validação do PWA Web Share Target:**
   - Clique em **Deploy**.
   - Acesse a aplicação instalando-a como PWA no celular (*Adicionar à Tela de Início*).
   - Teste o envio de links via compartilhamento nativo para o endpoint `/api/ingest/share-target`.
