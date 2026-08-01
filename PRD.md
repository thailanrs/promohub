# Documento de Requisitos do Produto (PRD)
## PromoHub — SaaS de Automação, Enriquecimento e Roteamento Inteligente de Ofertas

---

| Informação | Detalhe |
| :--- | :--- |
| **Nome do Produto** | PromoHub (SaaS) |
| **Versão** | 1.1 (MVP Atualizado) |
| **Status** | Aprovado para Desenvolvimento |
| **Arquitetura Base** | Multi-Tenant (Isolamento Lógico), Mobile-First PWA |
| **Público-Alvo (ICP)** | Pequenos e médios afiliados, gestores de comunidades de ofertas |

---

## 1. Visão Geral & Objetivos Estratégicos

### 1.1 Contexto de Mercado
O mercado de marketing de afiliados em e-commerce (Amazon, Shopee, Mercado Livre, Magalu, AliExpress, Lomadee) movimenta bilhões anualmente. A rotina dos gestores de grupos de ofertas envolve monitorar múltiplos canais do Telegram, converter links brutos em links de afiliados com suas respectivas tags, formatar textos persuasivos e republicar o conteúdo em dezenas de grupos no WhatsApp, Telegram e Discord.

Atualmente, essa operação é realizada manualmente ou através de ferramentas desktop rígidas. O **PromoHub** surge como uma plataforma SaaS **Mobile-First** e **Multi-Tenant** que automatiza a ingestão, conversão de afiliados, enriquecimento com Inteligência Artificial e roteamento de ofertas para múltiplos nichos, permitindo ao usuário gerenciar toda a operação diretamente do smartphone.

### 1.2 Proposta de Valor
* **Eficiência Operacional:** Redução de até 90% no tempo gasto para capturar, converter e republicar promoções.
* **Ingestão Centralizada e Reuso Inteligente:** Arquitetura otimizada onde scrapers centrais leem fontes comuns uma única vez e distribuem para múltiplos tenants de forma isolada.
* **Controle Total (Modo Automático ou Híbrido):** Escolha entre postagem 100% autônoma ou aprovação manual em 1 segundo via interface *Swipe* (estilo Tinder) otimizada para uso em telas sensíveis ao toque.
* **Multi-Nicho e Multi-Canal:** Flexibilidade para direcionar fontes específicas para nichos e grupos específicos com regras de filtro customizadas.

### 1.3 Indicadores Chave de Desempenho (KPIs do SaaS)
* **SLA de Processamento E2E:** $< 60$ segundos desde a captura na fonte até a postagem no grupo de destino.
* **Retenção de Tenants (Churn Mensal):** $< 5\%$.
* **Engajamento Diário (DAU/MAU):** $> 60\%$ dos tenants ativos utilizando a tela de aprovação por Swipe diariamente.
* **Taxa de Erro na Conversão de Links:** $< 0,1\%$.

---

## 2. Perfil do Cliente Ideal (ICP) & Personas

### 2.1 Perfil do Cliente Ideal (ICP)
* **Perfil:** Pequenos e médios afiliados individuais ou pequenas equipes que gerenciam de 1 a 15+ grupos de promoções no WhatsApp, Telegram ou Discord.
* **Dores Principais:**
  * Dependência de computador para rodar bots de automação.
  * Lentidão no processo de pegar um link, abrir o painel da Shopee/Amazon, gerar a tag e mandar no grupo.
  * Perda de vendas em ofertas relâmpago por atraso no disparo ou divulgação de produtos já esgotados.
  * Dificuldade de filtrar produtos duplicados ou sem desconto real.
  * Risco constante de banimento em contas do WhatsApp por automações mal estruturadas.

---

## 3. Arquitetura Multi-Tenant & Ingestão Centralizada

### 3.1 Isolamento Lógico (Logical Isolation)
A plataforma adota um modelo **Multi-Tenant com Isolamento Lógico**. Todas as entidades do banco de dados compartilham a mesma estrutura e servidor, sendo estritamente segregadas por uma coluna `tenant_id` indexada.

### 3.2 Motor de Ingestão Compartilhado (Shared Scraper Engine)
Desacoplamento da **Ingestão de Ofertas** da **Distribuição para os Tenants**:

```text
+-----------------------------------------------------------------------+
|                       SHARED SCRAPER ENGINE                           |
|  (Monitora Telegram, Feeds RSS, Webhooks, Promobit de forma central)  |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                    NORMALIZAÇÃO & HASH ÚNICA                          |
|    (Calcula Hash do Produto baseada no Canonical URL e Store ID)      |
+-----------------------------------------------------------------------+
                                   │
             ┌─────────────────────┴─────────────────────┐
             ▼                                           ▼
+-------------------------+                 +-------------------------+
|    PIPELINE TENANT A    |                 |    PIPELINE TENANT B    |
| (Filtro Tech: Desc >10%)|                 | (Filtro Bebês / Fralda) |
+-------------------------+                 +-------------------------+
             │                                           │
             ▼                                           ▼
+-------------------------+                 +-------------------------+
|  Injeta Tag Amazon A    |                 |  Injeta Tag Amazon B    |
|  Reescreve com IA (Tom A)|                |  Reescreve com IA (Tom B)|
+-------------------------+                 +-------------------------+
             │                                           │
             ▼                                           ▼
+-------------------------+                 +-------------------------+
|  Envio: WhatsApp/Tg A   |                 |  Envio: Telegram B      |
+-------------------------+                 +-------------------------+
```

---

## 4. Requisitos Funcionais Detalhados

### Módulo A: Ingestão e Monitoramento de Fontes (Input)

| ID | Requisito | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RF-A01** | **Scraper Telegram Público/Privado** | Capacidade de ler mensagens em tempo real de canais e grupos do Telegram configurados como fonte. | MVP (P0) |
| **RF-A02** | **Entrada Manual Otimizada** | Campo na dashboard para colar links brutos de produtos com processamento automático em 1 clique. | MVP (P0) |
| **RF-A03** | **PWA Web Share Target** | Permitir que o app receba links compartilhados diretamente do navegador mobile (Chrome, Safari, Instagram) através do menu nativo "Compartilhar". | MVP (P0) |
| **RF-A04** | **Monitoramento por Webhook** | Endpoint para receber payload de ofertas provenientes de sistemas externos ou scrapers terceiros. | P1 |
| **RF-A05** | **Deduplicação Inteligente** | Identificar ofertas do mesmo produto recebidas nas últimas $X$ horas e descartar automaticamente para evitar *spam*. | MVP (P0) |

### Módulo B: Motor de Afiliados, APIs & Gestão de Links

| ID | Requisito | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RF-B01** | **Unshortener de Deep-Links** | Resolver URLs encurtadas (`amzn.to`, `shope.ee`, `mercadolivre.com/sec/`, `t.me/`) para extrair a URL final canônica. | MVP (P0) |
| **RF-B02** | **Integrações Nativas de APIs** | Suporte nativo para **Amazon PA-API**, **Shopee API**, **AliExpress API** e **Lomadee**. | MVP (P0) |
| **RF-B03** | **Fallback de Encurtadores e Links Diretos** | Caso o tenant não possua chave API da plataforma, utilizar encurtador universal (Awin) ou permitir injeção de tag diretamente no link final. | MVP (P0) |
| **RF-B04** | **Reescrita com Inteligência Artificial** | Integração com LLM para extração de preços (De/Por), cupons de desconto e reescrita de copy no tom de voz selecionado. | MVP (P0) |
| **RF-B05** | **Verificação de Esgotamento (Background Job)** | Worker executado a cada 1 hora checando os links disparados nas últimas 24h. Se status HTTP for 404 ou o HTML contiver "esgotado", **editar a mensagem no WhatsApp/Telegram** adicionando a flag `❌ ESGOTADO`. | MVP (P0) |
| **RF-B06** | **Tratamento de Imagens** | Download automático da imagem principal do produto para envio limpo ou geração de preview formatado. | MVP (P0) |

### Módulo C: Gestão de Nichos & Roteamento (Pipelines)

| ID | Requisito | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RF-C01** | **Criação de Pipelines por Nicho** | Agrupamento lógico vinculando Fontes de Entrada $ightarrow$ Regras/Filtros $ightarrow$ Grupos de Destino. | MVP (P0) |
| **RF-C02** | **Filtros de Palavras-Chave** | Filtro de inclusão (ex: apenas "fralda", "notebook") e exclusão (ex: ignorar "usado", "recondicionado"). | MVP (P0) |
| **RF-C03** | **Filtro de Desconto Mínimo** | Regra para barrar ofertas cujo percentual de desconto detectado seja inferior ao limite configurado. | MVP (P0) |
| **RF-C04** | **Horário de Silêncio (Quiet Hours)** | Retirar disparos automáticos durante a madrugada, acumulando na fila para liberação matutina. | MVP (P0) |
| **RF-C05** | **Controle de Frequência (Drip Feed)** | Estabelecer intervalo mínimo entre postagens no mesmo grupo (ex: mínimo de 10 minutos entre mensagens). | MVP (P0) |

### Módulo D: Fila de Aprovação Híbrida (Swipe Inbox)

| ID | Requisito | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RF-D01** | **Modo de Operação por Pipeline** | Alternador para cada pipeline operar em modo "100% Automático" ou "Aprovação Manual". | MVP (P0) |
| **RF-D02** | **Interface Swipe Cards (Estilo Tinder)** | Interface otimizada para celular apresentando foto, título, preço, copy e link em formato de card manipulável por gestos. | MVP (P0) |
| **RF-D03** | **Ações de Swipe** | **Arraste para Direita:** Aprova e agenda/dispara. **Arraste para Esquerda:** Descarta oferta. | MVP (P0) |
| **RF-D04** | **Edição Expressa Mobile** | Modal inline acessível com toque simples para ajustar rápida e manualmente o preço ou copy antes do disparo. | MVP (P0) |

### Módulo E: Destinos e Publicação (Output)

| ID | Requisito | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RF-E01** | **WhatsApp via QR Code** | Pareamento de sessão via QR Code e postagem em grupos selecionados da conta pareada. | MVP (P0) |
| **RF-E02** | **Telegram Bot API** | Envio de ofertas com texto rico (HTML/Markdown), imagem e botões inline interativos. | MVP (P0) |
| **RF-E03** | **Discord Webhooks** | Publicação em canais do Discord com formatação visual em *Embeds*. | MVP (P0) |
| **RF-E04** | **Edição de Mensagens Já Publicadas** | API do bot com capacidade de atualizar mensagens ativas nos canais para sinalizar alteração de estado (ex: "ESGOTADO"). | MVP (P0) |
| **RF-E05** | **Simulação de Digitação/Pausa Humanizada** | Intervalos aleatórios antes dos envios no WhatsApp para evitar padrões automatizados detectáveis. | MVP (P0) |

### Módulo F: Analytics & Redirecionador (Com Foco em Privacidade/LGPD)

| ID | Requisito | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RF-F01** | **Encurtador/Redirecionador Interno** | Geração de links próprios (`domain.com/p/abc123`) para rastreamento prévio de cliques. | MVP (P0) |
| **RF-F02** | **Suporte a Domínio Customizado** | Permissão para o tenant conectar seu próprio subdomínio (ex: `ofertas.seusite.com`). | MVP (P0) |
| **RF-F03** | **Anonimização de Métricas (LGPD)** | Armazenamento estrito de: Data/Hora, IP (hasheado com SHA-256) e Grupo de Origem. NENHUM dado pessoal do comprador final é armazenado. | MVP (P0) |
| **RF-F04** | **Dashboard de Cliques em Tempo Real** | Métricas de total de cliques, top ofertas do dia, top grupos com mais engajamento e taxa de conversão estimada. | MVP (P0) |
| **RF-F05** | **Monitor de Saúde das Conexões** | Painel exibindo status em tempo real da conexão do WhatsApp (Conectado/Desconectado), Telegram e APIs. | MVP (P0) |

---

## 5. Arquitetura de Monetização & Limites SaaS (Plano Fixo Otimizado)

### 5.1 Matriz de Planos SaaS

| Recurso / Limite | Plano Free (Degustação) | Plano Pro (Mensal Fixo) | Plano Agência / Escala |
| :--- | :--- | :--- | :--- |
| **Grupos Conectados** | 1 Grupo (WhatsApp ou Telegram) | Até 5 Grupos Conectados | Grupos Ilimitados |
| **Limite de Disparos** | Até 20 ofertas / dia | Ofertas Ilimitadas / dia* | Ofertas Ilimitadas / dia* |
| **Modo de Envio** | **Aprovação Manual Obrigatória** (Swipe) | Modo 100% Automático + Swipe | Modo 100% Automático + Swipe |
| **Workspaces / Nichos** | 1 Pipeline / Nicho | Múltiplos Pipelines / Nichos | Múltiplos Pipelines / Nichos |
| **Conexões de WhatsApp** | 1 Número (Sessão única) | 1 Número | Múltiplos Números (Rodízio Anti-Ban) |
| **Analytics & Relatórios** | Básicos (últimos 7 dias) | Completo (Cliques, Top Grupos) | Completo + Exportação de Dados |
| **Objetivo Estratégico** | Provar a eficiência do produto | Escalar operação de afiliado solo | Atender agências e grandes redes |

---

## 6. Governança de Desenvolvimento Spec-Driven (Antigravity Framework)

1. **Arquitetura Modular Desacoplada:** O desenvolvimento deve seguir estritamente os módulos delimitados no `SPEC.md`. Nenhuma funcionalidade deve cruzar fronteiras de módulo sem um contrato de interface tipado (`Zod` + `TypeScript`).
2. **Contexto Restrito por Task:** Cada execução de IA atuará exclusivamente no escopo do seu arquivo de tarefa especificado em `tasks/`, carregando apenas o contexto relevante.
3. **Loop Obrigatório de Autoverificação:** Nenhuma tarefa será considerada concluída sem passar por validação de tipos (`tsc --noEmit`), linters e testes unitários/de integração do módulo afetado.

---
*Fim do Documento PRD — PromoHub SaaS v1.1*
