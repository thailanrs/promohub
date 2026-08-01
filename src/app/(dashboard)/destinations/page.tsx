'use client';

import React, { useState, useEffect } from 'react';
import { Send, QrCode, MessageSquare, CheckCircle2, RefreshCw, Smartphone, Plus, X } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  type: 'whatsapp' | 'telegram' | 'discord';
  config: any;
  status: string;
  lastActive: string;
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [whatsappSession, setWhatsappSession] = useState<any>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTestSendOpen, setIsTestSendOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('5511999999999');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [testResponseMsg, setTestResponseMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await fetch('/api/destinations');
      const data = await res.json();
      setDestinations(data.destinations || []);
      setWhatsappSession(data.whatsappSession || null);
    } catch {
      console.error('Erro ao buscar destinos');
    }
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestStatus('sending');
    setTestResponseMsg(null);

    try {
      const res = await fetch('/api/dispatch/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationJid: testPhoneNumber,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestStatus('success');
        setTestResponseMsg(data.sentMessage);
      } else {
        alert(data.error || 'Erro no envio');
        setTestStatus('idle');
      }
    } catch {
      alert('Erro ao conectar ao servidor de disparo.');
      setTestStatus('idle');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Send className="w-6 h-6 text-indigo-400" />
            Canais de Destino & WhatsApp Session
          </h1>
          <p className="text-sm text-slate-400">
            Gerencie o pareamento do WhatsApp via QR Code, bots do Telegram e webhooks do Discord para distribuição de ofertas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTestSendOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Testar Disparo Final</span>
          </button>

          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>QR Code WhatsApp</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Connection Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                WhatsApp Baileys Engine
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                  Conectado
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sessão pareada: <strong className="text-slate-200">{whatsappSession?.phoneNumber || '+55 11 99887-6655'}</strong> ({whatsappSession?.pushName || 'PromoHub Bot'})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-conectar QR Code
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          O serviço do WhatsApp na VPS simula pausas humanizadas de digitação antes de cada postagem para prevenir banimentos em contas comerciais.
        </p>
      </div>

      {/* Destinations List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-200">Grupos e Canais de Distribuição Ativos</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold font-mono uppercase text-indigo-400">
                  {dest.type}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Ativo
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-100">{dest.name}</h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {dest.config.jid || dest.config.chatId || dest.config.webhookUrl}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                <span>Último disparo:</span>
                <span className="font-mono text-slate-400">{dest.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal QR Code */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Pareamento WhatsApp Web</h3>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Abra o WhatsApp no seu smartphone, vá em <strong>Aparelhos Conectados -&gt; Conectar um Aparelho</strong> e escaneie o código abaixo:
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg border border-slate-200">
              {/* QR Code graphic placeholder */}
              <div className="w-48 h-48 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-slate-100 p-2 space-y-2">
                <QrCode className="w-24 h-24 text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400">Sessão Ativa PromoHub</span>
              </div>
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Disparo de Teste Final */}
      {isTestSendOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Send className="w-5 h-5" />
                <h3 className="font-bold text-slate-100 text-base">Disparo de Teste Final (WhatsApp)</h3>
              </div>
              <button onClick={() => setIsTestSendOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Envie uma mensagem promocional formatada com imagem, emojis e tag de afiliado para o seu número de teste.
            </p>

            <form onSubmit={handleTestSend} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Número de WhatsApp de Destino</label>
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="5511999999999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {testResponseMsg && (
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {testResponseMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={testStatus === 'sending'}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {testStatus === 'sending' ? (
                  <span>Disparando via Worker WhatsApp...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Oferta de Teste Agora</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
