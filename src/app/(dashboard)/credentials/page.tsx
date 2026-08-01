'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, Save, CheckCircle2, Lock } from 'lucide-react';

export default function CredentialsPage() {
  const [amazonTag, setAmazonTag] = useState('');
  const [shopeeSubId, setShopeeSubId] = useState('');
  const [shopeeAppId, setShopeeAppId] = useState('');
  const [mlUtmSource, setMlUtmSource] = useState('');
  const [mlMattTool, setMlMattTool] = useState('');
  const [awinPublisherId, setAwinPublisherId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/credentials');
      const data = await res.json();
      if (data.credentials) {
        setAmazonTag(data.credentials.amazonTag || '');
        setShopeeSubId(data.credentials.shopeeSubId || '');
        setShopeeAppId(data.credentials.shopeeAppId || '');
        setMlUtmSource(data.credentials.mlUtmSource || '');
        setMlMattTool(data.credentials.mlMattTool || '');
        setAwinPublisherId(data.credentials.awinPublisherId || '');
      }
    } catch {
      console.error('Erro ao buscar credenciais');
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amazonTag,
          shopeeSubId,
          shopeeAppId,
          mlUtmSource,
          mlMattTool,
          awinPublisherId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveMessage(data.message);
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        alert(data.error || 'Erro ao salvar credenciais.');
      }
    } catch {
      alert('Erro ao conectar com servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-indigo-400" />
          Credenciais & Tags de Afiliados
        </h1>
        <p className="text-sm text-slate-400">
          Configure suas tags de rastreamento das plataformas de e-commerce. Seus tokens são encriptados com segurança <strong className="text-slate-200">AES-256-GCM</strong>.
        </p>
      </div>

      {/* Security Info Banner */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
        <div className="text-xs text-indigo-200">
          <span className="font-bold block">Proteção de Credenciais Ativa:</span>
          As chaves de API e tags são encriptadas em repouso no banco de dados e descriptografadas apenas durante o momento da injeção de links nos workers da VPS.
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleSaveCredentials} className="space-y-6">
        {/* Amazon Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-lg">📦</span>
            <h2 className="font-bold text-base text-slate-100">Amazon Associates</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tag de Afiliado Amazon (ex: promohub-20)
            </label>
            <input
              type="text"
              value={amazonTag}
              onChange={(e) => setAmazonTag(e.target.value)}
              placeholder="promohub-20"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Shopee Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-lg">🧡</span>
            <h2 className="font-bold text-base text-slate-100">Shopee Affiliate Program</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sub ID de Rastreamento (ex: promohub_tech)
              </label>
              <input
                type="text"
                value={shopeeSubId}
                onChange={(e) => setShopeeSubId(e.target.value)}
                placeholder="promohub_tech"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Shopee App ID / Token API
              </label>
              <input
                type="password"
                value={shopeeAppId}
                onChange={(e) => setShopeeAppId(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Mercado Livre Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-lg">⚡️</span>
            <h2 className="font-bold text-base text-slate-100">Mercado Livre Afiliados</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                UTM Source / Tag Afiliado
              </label>
              <input
                type="text"
                value={mlUtmSource}
                onChange={(e) => setMlUtmSource(e.target.value)}
                placeholder="promohub_deals"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Matt Tool ID
              </label>
              <input
                type="text"
                value={mlMattTool}
                onChange={(e) => setMlMattTool(e.target.value)}
                placeholder="matt_9988"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Awin Fallback Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-lg">🌐</span>
            <h2 className="font-bold text-base text-slate-100">Encurtador Universal Fallback (Awin)</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Awin Publisher ID (Para lojas sem API nativa)
            </label>
            <input
              type="text"
              value={awinPublisherId}
              onChange={(e) => setAwinPublisherId(e.target.value)}
              placeholder="awin_pub_7788"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
        >
          {isSaving ? (
            <span>Criptografando & Salvando...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Salvar Credenciais de Afiliados</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
