# Especificação Técnica (SPEC.md) — PromoHub SaaS

## 1. Módulos do Sistema e Limites de Contexto

O PromoHub é dividido em 6 módulos independentes. Cada módulo possui seus próprios tipos, serviços e testes isolados.

```text
[ Module A: Ingestion ] ➔ [ Module B: LinkEngine ] ➔ [ Module C: PipelineEngine ]
                                                              │
[ Module F: Analytics ] ⬅ [ Module E: OutputEngine ] ⬅ [ Module D: SwipeInbox ]
```

### Módulo A: Ingestion Engine (`src/modules/ingestion`)
* **Responsabilidade:** Captura de links via Web Share Target (PWA), Telegram Webhooks/Scrapers e Entrada Manual.
* **Saída:** Objeto `RawPayload` padronizado.

### Módulo B: Link Engine & Affiliation (`src/modules/link-engine`)
* **Responsabilidade:** Unshortener HTTP, parsing de canonical URL, extração de IDs de produtos via Regex e injeção de tags de afiliados (Amazon PA-API, Shopee API, Mercado Livre, Fallback Awin).
* **Entrada:** `RawPayload` | **Saída:** `AffiliateOffer`

### Módulo C: Pipeline & Rules Engine (`src/modules/pipeline`)
* **Responsabilidade:** Avaliação de regras por tenant (palavras-chave, desconto mínimo, quiet hours) e chamada de IA para reescrita de copy.
* **Entrada:** `AffiliateOffer` | **Saída:** `EnrichedOffer`

### Módulo D: Swipe Inbox & Approval (`src/modules/swipe`)
* **Responsabilidade:** Gerenciamento da fila de aprovação manual no PWA (Modo Híbrido) e limites de planos PLG.

### Módulo E: Output & Distribution Engine (`src/modules/output`)
* **Responsabilidade:** Disparo humanizado para WhatsApp (Baileys/Evolution API), Telegram e Discord com controle de delay anti-banimento.

### Módulo F: Analytics & Redirect (`src/modules/analytics`)
* **Responsabilidade:** Encurtador próprio, redirecionamento veloz (<50ms) e coleta de cliques anonimizada (SHA-256 do IP).

---

## 2. Contratos de Tipo e Interfaces Principais (TypeScript + Zod)

```typescript
import { z } from 'zod';

export const EnrichedOfferSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  pipelineId: z.string().uuid(),
  canonicalUrl: z.string().url(),
  affiliateUrl: z.string().url(),
  shortCode: z.string().min(5),
  store: z.enum(['amazon', 'shopee', 'mercadolivre', 'magalu', 'ali-express', 'other']),
  title: z.string().min(3).max(500),
  originalPrice: z.number().nullable(),
  discountedPrice: z.number(),
  discountPercent: z.number().min(0).max(100),
  couponCode: z.string().nullable(),
  imageUrl: z.string().url(),
  aiCopy: z.string(),
  isOutOfStock: z.boolean().default(false),
  status: z.enum(['pending', 'approved', 'rejected', 'published', 'failed']),
  createdAt: z.date(),
});

export type EnrichedOffer = z.infer<typeof EnrichedOfferSchema>;
```

---

## 3. Arquitetura de Filas e Eventos (BullMQ + Redis)

* **`queue:ingestion`**: Processa mensagens brutas capturadas de canais.
* **`queue:enrichment`**: Executa unshortening, injeção de tags de afiliado e chamada para LLM.
* **`queue:dispatch`**: Gerencia o envio com delay humanizado para os grupos de destino.
* **`cron:stock-checker`**: Worker executado a cada 1 hora para validar ofertas das últimas 24h.
