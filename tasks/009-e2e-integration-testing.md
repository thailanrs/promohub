# Tarefa 009: Testes E2E & Integração do Fluxo Completo

## Contexto & Escopo
Criar uma suíte de testes de integração E2E (End-to-End) simulando o ciclo de vida completo de uma oferta no PromoHub: desde a captura (Ingestão/Share Target), passando pelo Unshortener, Injeção de Tags, Avaliador de Regras/IA, enfileiramento BullMQ até o recebimento no Swipe Inbox e disparo formatado no WhatsApp.

## Arquivos a Criar / Alterar
* `src/tests/e2e-pipeline.test.ts`
* `src/tests/mocks/integration-fixtures.ts`
* `tasks/009-e2e-integration-testing.md`

## Critérios de Aceite
1. Simular payload bruto de entrada (link encurtado com parâmetros de rastreamento).
2. Validar que a URL é resolvida, limpa e injetada com a tag de afiliado configurada.
3. Verificar que o motor de regras avalia corretamente e a copy por IA é gerada.
4. Validar o enfileiramento no BullMQ e o processamento pelo Worker em < 60 segundos.
5. Validar a geração do payload final pronto para renderização no Swipe Inbox ou envio via WhatsApp Publisher.
6. Passar no teste de integração E2E com 100% de sucesso.
