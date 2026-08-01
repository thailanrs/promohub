# Tarefa 007: Pipeline & AI Engine — Filtros de Regras & Reescrita de Copy com LLM

## Contexto & Escopo
Implementar o motor de pipelines e regras (`pipeline`), avaliando desconto mínimo, palavras-chave de inclusão/exclusão, quiet hours e integrando com modelo de linguagem (LLM/IA) para reescrever copys persuasivas e extrair preços e cupons.

## Arquivos a Criar / Alterar
* `src/modules/pipeline/services/rules-evaluator.service.ts`
* `src/modules/pipeline/services/ai-copywriter.service.ts`
* `src/modules/pipeline/types.ts`
* `src/modules/pipeline/tests/pipeline.test.ts`

## Critérios de Aceite
1. Avaliação rigorosa das regras do pipeline (barrar desconto abaixo do mínimo, barrar palavras excluídas).
2. Prompt estruturado para LLM extraindo título, preço de/por, cupom e gerando copy no tom do tenant.
3. Testes unitários cobrindo todos os cenários de filtros.
