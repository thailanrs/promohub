# Tarefa 004: UI Mobile — Componente de Swipe Inbox com Framer Motion

## Contexto & Escopo
Criar o componente frontend mobile-first de aprovação manual por gestos (*Swipe Cards* no estilo Tinder) em Next.js com Framer Motion e Tailwind CSS, incluindo modal de edição expressa e botão de disparo.

## Arquivos a Criar / Alterar
* `src/modules/swipe/components/SwipeCard.tsx`
* `src/modules/swipe/components/SwipeInbox.tsx`
* `src/modules/swipe/components/EditOfferModal.tsx`
* `src/app/(dashboard)/swipe/page.tsx`

## Critérios de Aceite
1. Animação de arraste fluida ( Swipe Right = Aprovar, Swipe Left = Rejeitar) com física de mola no Framer Motion.
2. Botões táteis na barra inferior como alternativa ao gesto de arrastar.
3. Exibição de badge de desconto, foto do produto, preços De/Por e preview da copy da IA.
4. Totalmente responsivo para telas móveis (Mobile-First).
