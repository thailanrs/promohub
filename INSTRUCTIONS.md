# Diretrizes Locais de Código e Padrões (PromoHub SaaS)

## 1. Tech Stack Obrigatória
* **Framework Web:** Next.js (App Router, Server Actions)
* **Estilização:** Tailwind CSS + Shadcn/ui + Framer Motion (Mobile-First)
* **Linguagem:** TypeScript (Strict Mode ativado, `noImplicitAny: true`)
* **ORM & Banco:** Drizzle ORM / PostgreSQL
* **Filas & Cache:** BullMQ + Redis (ioredis)
* **Validação de Schemas:** Zod (Obrigatório em todas as bordas de API/Formulários)

## 2. Princípios de Arquitetura e Código
1. **Zero `any` Policy:** Todo tipo deve ser explicitamente definido ou inferido via Zod.
2. **Early Returns & Defensive Coding:** Evite aninhamentos profundos de `if/else`.
3. **Feature-Driven Directory Structure:**
   ```text
   src/
   ├── modules/
   │   ├── link-engine/
   │   │   ├── components/
   │   │   ├── services/
   │   │   ├── types.ts
   │   │   └── link-engine.test.ts
   ```
4. **Tratamento de Erros:** Utilize o padrão Result Pattern ou blocos `try/catch` com logs estruturados contendo o `tenant_id`.

## 3. Segurança e Criptografia
* Nunca grave tokens de afiliados ou chaves de API do tenant em texto puro. Sempre utilize o helper `encryptGCM()` / `decryptGCM()`.
* Nunca exponha dados pessoais identificáveis (PII) no tracker de cliques.

## 4. Loop de Autoverificação Obrigatório
Antes de marcar qualquer tarefa como concluída, execute:
1. `npm run type-check` (Validação de tipos sem emitir build)
2. `npm run lint` (Verificação de padrões)
3. `npm run test:unit` (Testes isolados do módulo)
