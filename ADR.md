# Registro de Decisões de Arquitetura (ADR) — PromoHub

## ADR 001: Adoção de PWA com Web Share Target para Interface Mobile
* **Status:** Aprovado
* **Contexto:** O público-alvo (afiliados) precisa operar no celular com agilidade máxima.
* **Decisão:** Utilizar Next.js com PWA nativo e a Web Share Target API.
* **Consequência:** Permite que o usuário compartilhe produtos diretamente de apps nativos (Amazon, Shopee, Chrome) para o PromoHub sem abrir a dashboard manualmente.

## ADR 002: Isolamento Lógico Multi-Tenant em Banco Compartilhado
* **Status:** Aprovado
* **Contexto:** Necessidade de escalar para milhares de pequenos usuários mantendo baixo custo de infraestrutura.
* **Decisão:** Tabela compartilhada com coluna `tenant_id` indexada em todas as entidades e Middleware de segurança forçando a cláusula no ORM.

## ADR 003: Microserviço de WhatsApp com Sessões Desacopladas (Baileys)
* **Status:** Aprovado
* **Contexto:** A API Oficial do WhatsApp é inviável financeiramente para o modelo de grupos de ofertas.
* **Decisão:** Utilizar Baileys/Evolution API em microserviço Node.js isolado com persistência de sessão em Redis/Storage criptografado `AES-256-GCM`.

## ADR 004: Desenvolvimento Dirigido a Especificação (Antigravity Spec-Driven)
* **Status:** Aprovado
* **Contexto:** Evitar alucinações de IA, quebra de regras de negócio e acoplamento desnecessário.
* **Decisão:** Toda feature deve ser fatiada em especificações curtas em `tasks/`, contendo plano de testes e critérios de aceite claros antes do código ser gerado.
