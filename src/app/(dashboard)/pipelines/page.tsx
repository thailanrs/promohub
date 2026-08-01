'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Check, Clock, ShieldAlert, Sparkles, Bot, Eye } from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  aiTone: 'persuasive' | 'informative' | 'direct' | 'urgent';
  minDiscountPercent: number;
  keywordsInclude: string[];
  keywordsExclude: string[];
  quietHoursStart: string;
  quietHoursEnd: string;
  isAutoApprove: boolean;
  isActive: boolean;
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for creating new pipeline
  const [name, setName] = useState('');
  const [minDiscountPercent, setMinDiscountPercent] = useState(10);
  const [aiTone, setAiTone] = useState<'persuasive' | 'informative' | 'direct' | 'urgent'>('persuasive');
  const [keywordsIncludeStr, setKeywordsIncludeStr] = useState('');
  const [keywordsExcludeStr, setKeywordsExcludeStr] = useState('');
  const [quietHoursStart, setQuietHoursStart] = useState('01:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('06:00');
  const [isAutoApprove, setIsAutoApprove] = useState(false);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      const res = await fetch('/api/pipelines');
      const data = await res.json();
      setPipelines(data.pipelines || []);
    } catch {
      console.error('Erro ao buscar pipelines');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          minDiscountPercent: Number(minDiscountPercent),
          aiTone,
          keywordsInclude: keywordsIncludeStr.split(',').map((s) => s.trim()).filter(Boolean),
          keywordsExclude: keywordsExcludeStr.split(',').map((s) => s.trim()).filter(Boolean),
          quietHoursStart,
          quietHoursEnd,
          isAutoApprove,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setKeywordsIncludeStr('');
        setKeywordsExcludeStr('');
        fetchPipelines();
      }
    } catch {
      alert('Erro ao salvar pipeline.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-400" />
            Pipelines & Nichos de Oferta
          </h1>
          <p className="text-sm text-slate-400">
            Configure as regras de filtragem por palavras-chave, desconto mínimo %, horário de silêncio e tom da IA.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Pipeline</span>
        </button>
      </div>

      {/* Pipelines Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Carregando pipelines...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pipelines.map((pip) => (
            <div
              key={pip.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-100">{pip.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">ID: {pip.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      pip.isAutoApprove
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {pip.isAutoApprove ? <Bot className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {pip.isAutoApprove ? '100% Automático' : 'Aprovação Swipe'}
                  </span>
                </div>
              </div>

              {/* Rules Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Desconto Mínimo</span>
                  <span className="font-bold text-slate-200 text-sm">{pip.minDiscountPercent}% OFF</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Tom da IA</span>
                  <span className="font-bold text-indigo-400 text-sm uppercase">{pip.aiTone}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 col-span-2 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Horário de Silêncio (Madrugada):
                  </span>
                  <span className="font-bold font-mono text-slate-200">
                    {pip.quietHoursStart} às {pip.quietHoursEnd}
                  </span>
                </div>
              </div>

              {/* Keywords inclusion & exclusion */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Palavras-Chave de Inclusão:</span>
                  <div className="flex flex-wrap gap-1">
                    {pip.keywordsInclude.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                        +{kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Palavras Excluídas:</span>
                  <div className="flex flex-wrap gap-1">
                    {pip.keywordsExclude.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
                        -{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Pipeline Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Criar Novo Pipeline por Nicho
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePipeline} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome do Nicho / Pipeline</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ofertas de Informática & Games"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Desconto Mínimo (% OFF)</label>
                  <input
                    type="number"
                    value={minDiscountPercent}
                    onChange={(e) => setMinDiscountPercent(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tom de Voz da IA</label>
                  <select
                    value={aiTone}
                    onChange={(e: any) => setAiTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="persuasive">Persuasivo (Vendas)</option>
                    <option value="informative">Informativo</option>
                    <option value="direct">Direto & Curto</option>
                    <option value="urgent">Urgência (Gatilho)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Palavras-Chave Obrigatórias (Separadas por vírgula)</label>
                <input
                  type="text"
                  value={keywordsIncludeStr}
                  onChange={(e) => setKeywordsIncludeStr(e.target.value)}
                  placeholder="smartphone, fone, notebook, alexa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Palavras Excluídas (Separadas por vírgula)</label>
                <input
                  type="text"
                  value={keywordsExcludeStr}
                  onChange={(e) => setKeywordsExcludeStr(e.target.value)}
                  placeholder="usado, reembalado, defeito"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Início do Silêncio</label>
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fim do Silêncio</label>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Modo 100% Automático</span>
                  <span className="text-[11px] text-slate-400">Publicar direto nos grupos sem passar pelo Swipe Inbox</span>
                </div>
                <input
                  type="checkbox"
                  checked={isAutoApprove}
                  onChange={(e) => setIsAutoApprove(e.target.checked)}
                  className="w-5 h-5 rounded accent-indigo-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30"
              >
                Salvar Pipeline
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
