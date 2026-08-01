'use client';

import React, { useState } from 'react';
import { SwipeInbox } from '@/modules/swipe/components/SwipeInbox';
import { EnrichedOffer } from '@/modules/swipe/types';
import { Flame, ShieldCheck, Zap } from 'lucide-react';

const MOCK_OFFERS: EnrichedOffer[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    tenantId: '00000000-0000-4000-a000-000000000000',
    pipelineId: '22222222-2222-4222-a222-222222222222',
    canonicalUrl: 'https://www.amazon.com.br/dp/B09B2SBHQK',
    affiliateUrl: 'https://www.amazon.com.br/dp/B09B2SBHQK?tag=promohub-20',
    shortCode: 'p/echot5',
    store: 'amazon',
    title: 'Echo Dot 5ª Geração | Smart Speaker com Alexa e som de alta qualidade',
    originalPrice: 429.0,
    discountedPrice: 269.1,
    discountPercent: 37,
    couponCode: 'ALEXA10',
    imageUrl: 'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg',
    aiCopy: '🔥 MENOR PREÇO DO ANO! Echo Dot 5ª Geração com Alexa por apenas R$ 269,10!\n\n⚡️ Aproveite o som potente e controle sua casa inteligente por voz.\n🎟 Use o cupom ALEXA10 no checkout.',
    isOutOfStock: false,
    status: 'pending',
    createdAt: new Date(),
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    tenantId: '00000000-0000-4000-a000-000000000000',
    pipelineId: '22222222-2222-4222-a222-222222222222',
    canonicalUrl: 'https://produto.mercadolivre.com.br/MLB-2000111222',
    affiliateUrl: 'https://produto.mercadolivre.com.br/MLB-2000111222?utm_source=promohub',
    shortCode: 'p/tv55ml',
    store: 'mercadolivre',
    title: 'Smart TV 55 4K UHD LED Samsung Crystal CU7700 Wi-Fi Bluetooth 3 HDMI',
    originalPrice: 2999.0,
    discountedPrice: 2199.0,
    discountPercent: 27,
    couponCode: 'TV100OFF',
    imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_608149-MLA70554162464_072023-O.webp',
    aiCopy: '📺 TELA GIGANTE 4K EM PROMOÇÃO!\nSmart TV Samsung 55 Crystal 4K de R$ 2.999 por R$ 2.199 em até 10x sem juros!\n\n🚀 Frete Grátis com entrega rápida Mercado Livre.',
    isOutOfStock: false,
    status: 'pending',
    createdAt: new Date(),
  },
  {
    id: '44444444-4444-4444-a444-444444444444',
    tenantId: '00000000-0000-4000-a000-000000000000',
    pipelineId: '22222222-2222-4222-a222-222222222222',
    canonicalUrl: 'https://shopee.com.br/product/998877/112233',
    affiliateUrl: 'https://shopee.com.br/product/998877/112233?sub_id=promo123',
    shortCode: 'p/fonebt',
    store: 'shopee',
    title: 'Fone de Ouvido Bluetooth Sem Fio TWS Bateria Duradoura Alta Fidelidade',
    originalPrice: 129.9,
    discountedPrice: 49.9,
    discountPercent: 62,
    couponCode: 'FONE20',
    imageUrl: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-lsi50106k2bc4c',
    aiCopy: '🎧 Fone Bluetooth TWS com 62% OFF por R$ 49,90 na Shopee!\n\n✨ Excelente graves e bateria de até 20 horas de reprodução.\n📦 Frete grátis liberado no app.',
    isOutOfStock: false,
    status: 'pending',
    createdAt: new Date(),
  },
];

export default function SwipePage() {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApprove = (offer: EnrichedOffer) => {
    showNotification(`🚀 Oferta "${offer.title.substring(0, 30)}..." APROVADA e disparada!`);
  };

  const handleReject = (offer: EnrichedOffer) => {
    showNotification(`❌ Oferta "${offer.title.substring(0, 30)}..." DESCARTADA.`);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 select-none">
      {/* Top Mobile Bar */}
      <header className="w-full max-w-md flex items-center justify-between py-3 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
              PromoHub <span className="text-[10px] text-indigo-400 font-semibold">SaaS</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Modo Híbrido — Swipe Inbox</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Tenant Ativo</span>
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div className="w-full max-w-md my-2 p-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xl text-center animate-bounce flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-amber-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Swipe Component */}
      <section className="w-full max-w-md my-auto">
        <SwipeInbox
          initialOffers={MOCK_OFFERS}
          onApprove={handleApprove}
          onReject={handleReject}
          onRefresh={handleRefresh}
        />
      </section>

      {/* Footer */}
      <footer className="w-full max-w-md py-3 text-center text-[11px] text-slate-500">
        PromoHub Mobile-First PWA • Gestos: Direita (Aprovar) | Esquerda (Descartar)
      </footer>
    </main>
  );
}
