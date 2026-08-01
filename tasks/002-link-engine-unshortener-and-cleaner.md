# Tarefa 002: Link Engine — Unshortener & Sanitização de URLs

## Contexto & Escopo
Implementar o serviço `unshortener.service.ts` no módulo `link-engine` para resolver URLs encurtadas da Amazon (`amzn.to`), Shopee (`shope.ee`) e Mercado Livre, limpando query params de terceiros.

## Arquivos a Criar / Alterar
* `src/modules/link-engine/services/unshortener.service.ts`
* `src/modules/link-engine/types.ts`
* `src/modules/link-engine/tests/unshortener.test.ts`

## Critérios de Aceite
1. Resolver URLs encurtadas em no máximo 5 segundos com fallback gracioso.
2. Extrair o ASIN da Amazon (`/dp/ASIN`) e montar URL limpa.
3. Limpar parâmetros de tracking de terceiros (`tag`, `linkCode`, `gclid`).
4. Cobertura de testes unitários $> 90\%$ para as funções de extração de Regex.
