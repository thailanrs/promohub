'use client';

import React, { useState } from 'react';
import { Link2, Sparkles, Clipboard, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { EnrichedOffer } from '@/modules/swipe/types';

export default function IngestPage() {
  const [inputUrl, setInputUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedOffer, setProcessedOffer] = useState<EnrichedOffer | null>(null);
  const [history, setHistory] = useState<any[]>([
    {
      id: 'ing_1',
      url: 'https://amzn.to/3Xyz123',
      store: 'amazon',
      status: 'Enriquecida',
      timestamp: '5 min atrás',
    },
    {
      id: 'ing_2',
      url: 'https://shope.ee/987654321',
      store: 'shopee',
      status: 'Descartada (Duplicada)',
      timestamp: '15 min atrás',
    },
  ]);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith('http')) {
        setInputUrl(text);
      } else {
        setRawText(text);
      }
    } catch {
      alert('Permissão de área de transferência não concedida.');
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessedOffer(null);

    try {
      const res = await fetch('/api/ingest/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl, rawText }),
      });

      const data = await res.json();
      if (res.ok) {
        setProcessedOffer(data.offer);
        setHistory((prev) => [
          {
            id: `ing_${Date.now()}`,
            url: inputUrl || data.offer.canonicalUrl,
            store: data.offer.store,
            status: 'Enriquecida',
            timestamp: 'Agora',
          },
          ...prev,
        ]);
        setInputUrl('');
        setRawText('');
      } else {
        alert(data.error || 'Erro na ingestão');
      }
    } catch {
      alert('Erro ao conectar ao servidor de ingestão.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <Link2 className="w-6 h-6 text-indigo-400" />
          Ingestão & Captura Manual
        </h1>
        <p className="text-sm text-slate-400">
          Cole links de ofertas brutos ou mensagens promocionais do Telegram/WhatsApp para enriquecimento automático por IA.
        </p>
      </div>

      {/* Manual Ingestion Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              Entrada em 1-Clique
            </h2>
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Colar da Área de Transferência
            </button>
          </div>

          <form onSubmit={handleIngest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL Bruta do Produto (Amazon, Shopee, Mercado Livre, Magalu)
              </label>
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://amzn.to/3xyz123 ou https://shope.ee/987654321"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Texto Promocional Completo (Opcional)
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={3}
                placeholder="🔥 Ofertão imperdível! Smartphone Echo Dot 5ª Geração com Alexa por apenas R$ 269,10! Cupom: ALEXA10"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
            >
              {isProcessing ? (
                <span>Processando com IA & Unshortener...</span>
              ) : (
                <>
                  <span>Ingerir & Enriquecer Oferta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info & PWA Share Target Instructions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              PWA Web Share Target
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No seu celular Android ou iOS, abra o aplicativo instalado no navegador e utilize o menu nativo <strong className="text-slate-200">"Compartilhar"</strong> em qualquer link de loja para enviar direto para a plataforma.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <p className="text-xs font-semibold text-indigo-400">Deduplicação Ativa</p>
            <p className="text-[11px] text-slate-400">
              Ofertas do mesmo produto enviadas nas últimas 24 horas são identificadas por hash única do produto e descartadas para evitar spam nos grupos.
            </p>
          </div>
        </div>
      </div>

      {/* Result Card preview if ingested */}
      {processedOffer && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Oferta Ingerida & Enriquecida com Sucesso!</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="text-slate-500">Título:</p>
              <p className="text-slate-200 font-bold">{processedOffer.title}</p>
            </div>
            <div>
              <p className="text-slate-500">Loja & Desconto:</p>
              <p className="text-slate-200 font-bold uppercase">{processedOffer.store} ({processedOffer.discountPercent}% OFF)</p>
            </div>
            <div>
              <p className="text-slate-500">URL Afiliado Injetada:</p>
              <p className="text-indigo-400 truncate">{processedOffer.affiliateUrl}</p>
            </div>
            <div>
              <p className="text-slate-500">Status:</p>
              <p className="text-emerald-400 font-bold uppercase">{processedOffer.status}</p>
            </div>
          </div>
        </div>
      )}

      {/* Ingestion History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-200">Histórico Recente de Ingestões</h2>

        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono font-bold uppercase text-[10px]">
                  {item.store}
                </span>
                <span className="text-slate-300 truncate font-mono">{item.url}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status.includes('Enriquecida')
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {item.status}
                </span>
                <span className="text-slate-500 text-[11px]">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
