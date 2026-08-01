# Tarefa 003: Link Engine — Injeção de Tags de Afiliados & Criptografia DEK/KEK

## Contexto & Escopo
Implementar o serviço de injeção de tags de afiliados (`affiliate-injector.service.ts`) e o helper de criptografia de credenciais (`crypto.ts`). O serviço recebe uma URL canônica limpa (produzida na Tarefa 002) e as credenciais do tenant do banco de dados, injetando as tags de afiliado da Amazon, Shopee, Mercado Livre ou acionando o fallback universal (Awin / Link Direto).

## Arquivos a Criar / Alterar
* `src/lib/crypto.ts` (Helper AES-256-GCM para criptografia/descriptografia de tokens)
* `src/modules/link-engine/services/affiliate-injector.service.ts`
* `src/modules/link-engine/tests/affiliate-injector.test.ts`
* `tasks/003-link-engine-affiliate-tag-injection.md`

## Critérios de Aceite
1. Helper `encryptGCM` e `decryptGCM` funcionando com `AES-256-GCM` e `IV` aleatório.
2. Injetar a tag do tenant na Amazon (`tag={amazonTag}`).
3. Injetar sub_id/tracking na Shopee e Mercado Livre.
4. Possuir tratamento de fallback caso o tenant não tenha credenciais cadastradas para a loja (manter link limpo ou usar fallback universal Awin).
5. Passar no teste unitário com 100% de sucesso.
