# Tarefa 008: Orquestração de Filas — BullMQ & Redis Workers (SLA < 60s)

## Contexto & Escopo
Conectar os módulos de Ingestão, Link Engine, Pipeline IA e Output Engine usando BullMQ + Redis, garantindo o processamento assíncrono e resiliente das ofertas com tempo de trânsito menor que 60 segundos.

## Arquivos a Criar / Alterar
* `src/lib/redis.ts`
* `src/queues/ingestion.queue.ts`
* `src/queues/enrichment.queue.ts`
* `src/queues/dispatch.queue.ts`
* `src/workers/index.ts`

## Critérios de Aceite
1. Filas desacopladas rodando com suporte a retentativas (exponential backoff).
2. Worker de checagem de esgotamento agendado a cada 1 hora.
3. SLA E2E verificado em < 60s.
