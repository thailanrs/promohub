'use client';

import React, { useState, useEffect } from 'react';
import { SwipeInbox } from '@/modules/swipe/components/SwipeInbox';
import { EnrichedOffer } from '@/modules/swipe/types';
import { Flame, ShieldCheck, Zap, Send, X, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SwipePage() {
  const [offers, setOffers] = useState<EnrichedOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testNumber, setTestNumber] = useState('5511999999999');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [lastSentMsg, setLastSentMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchOffersFromDb();
  }, []);

  const fetchOffersFromDb = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/offers');
      const data = await res.json();
      if (data.offers) {
        setOffers(data.offers);
      }
    } catch {
      console.error('Erro ao buscar ofertas do banco Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApprove = async (offer: EnrichedOffer) => {
    showNotification(`🚀 Oferta "${offer.title.substring(0, 25)}..." APROVADA!`);
    try {
      await fetch('/api/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offer.id, status: 'approved' }),
      });
    } catch {
      console.error('Erro ao atualizar status no banco');
    }
  };

  const handleReject = async (offer: EnrichedOffer) => {
    showNotification(`❌ Oferta "${offer.title.substring(0, 25)}..." DESCARTADA.`);
    try {
      await fetch('/api/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offer.id, status: 'rejected' }),
      });
    } catch {
      console.error('Erro ao descartar no banco');
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestStatus('sending');

    try {
      const res = await fetch('/api/dispatch/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationJid: testNumber,
          offer: offers[0] || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestStatus('success');
        setLastSentMsg(data.sentMessage);
        showNotification(`✅ Disparo enviado com sucesso para ${data.recipient}!`);
        setTimeout(() => {
          setIsTestModalOpen(false);
          setTestStatus('idle');
        }, 2000);
      } else {
        alert(data.error || 'Erro ao enviar mensagem de teste');
        setTestStatus('idle');
      }
    } catch {
      alert('Erro de conexão ao enviar mensagem de teste');
      setTestStatus('idle');
    }
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Testar Envio</span>
          </button>
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
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <span>Carregando ofertas pendentes do Supabase...</span>
          </div>
        ) : (
          <SwipeInbox
            initialOffers={offers}
            onApprove={handleApprove}
            onReject={handleReject}
            onRefresh={fetchOffersFromDb}
          />
        )}
      </section>

      {/* Modal Disparo de Teste para Número de WhatsApp */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Send className="w-5 h-5" />
                <h3 className="font-bold text-slate-100 text-base">Disparo de Teste WhatsApp</h3>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Informe o número de WhatsApp de teste para enviar a oferta com formatação completa (markdown, emojis e link encurtado).
            </p>

            <form onSubmit={handleSendTestMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número de WhatsApp (DDD + Número)
                </label>
                <input
                  type="text"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="5511999999999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {lastSentMsg && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {lastSentMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={testStatus === 'sending'}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {testStatus === 'sending' ? (
                  <span>Enviando mensagem...</span>
                ) : testStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mensagem Enviada!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Disparar Oferta de Teste</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-md py-3 text-center text-[11px] text-slate-500">
        PromoHub Mobile-First PWA • Gestos: Direita (Aprovar) | Esquerda (Descartar)
      </footer>
    </main>
  );
}
