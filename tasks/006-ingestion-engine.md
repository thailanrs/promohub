# Tarefa 006: Ingestion Engine — Web Share Target (PWA), Manual Input & Deduplicação

## Contexto & Escopo
Implementar o módulo de ingestão de ofertas (`ingestion`), responsável por capturar links de produtos vindo de múltiplas entradas: compartilhamento nativo do celular via PWA Web Share Target, formulário de entrada manual e webhooks/scrapers externos. Inclui o serviço de deduplicação inteligente para evitar ofertas duplicadas em um intervalo configurável de tempo.

## Arquivos a Criar / Alterar
* `src/modules/ingestion/types.ts`
* `src/modules/ingestion/services/ingestion.service.ts`
* `src/modules/ingestion/services/deduplication.service.ts`
* `src/modules/ingestion/tests/ingestion.test.ts`
* `src/app/api/ingest/share-target/route.ts` (Route Handler para PWA Web Share)
* `src/app/api/ingest/webhook/route.ts` (Route Handler para Telegram/Webhooks)

## Critérios de Aceite
1. Captura e parsing de payloads vindos de texto bruto, campos de formulário e query params de compartilhamento nativo.
2. Extração de URLs e texto explicativo dentro da mensagem recebida.
3. Algoritmo de hash de produto e cálculo de deduplicação em janela de tempo (ex: 24 horas).
4. Route Handler de Web Share Target respondendo adequadamente para redirecionar o usuário diretamente para o Swipe Inbox ou feedback visual.
5. Suíte de testes unitários com 100% de aprovação.
