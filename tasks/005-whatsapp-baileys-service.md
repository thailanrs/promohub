# Tarefa 005: Output Engine — Microserviço WhatsApp com Baileys & Delays Anti-Ban

## Contexto & Escopo
Criar o serviço de saída para o WhatsApp (`whatsapp-publisher.service.ts`) utilizando a biblioteca Baileys com suporte a múltiplos números por tenant, armazenamento de sessão criptografado e envio com delay humanizado.

## Arquivos a Criar / Alterar
* `src/modules/output/services/whatsapp-publisher.service.ts`
* `src/modules/output/types.ts`
* `src/modules/output/tests/whatsapp-publisher.test.ts`

## Critérios de Aceite
1. Suporte ao disparo de ofertas formatadas (texto com formatação Markdown do WhatsApp + imagem).
2. Mecanismo de delay aleatório ($15$s a $45$s) entre disparos para mitigar risco de banimento.
3. Armazenar os IDs das mensagens enviadas (`external_message_ids`) na tabela de ofertas para permitir edição posterior (ex: aviso de "ESGOTADO").
