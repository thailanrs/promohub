'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, ExternalLink, Activity, Server, Database, MessageSquare } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch {
      console.error('Erro ao carregar analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return <div className="p-8 text-center text-slate-500">Carregando métricas em tempo real...</div>;
  }

  const { metrics, topOffers, serviceHealth } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Analytics & Redirecionador
        </h1>
        <p className="text-sm text-slate-400">
          Métricas de cliques em tempo real, receita estimada e monitoramento de saúde da infraestrutura.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total de Cliques Hoje</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono">{metrics.totalClicksToday}</p>
          <span className="text-[11px] text-emerald-400 font-semibold">+18.4% vs ontem</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Visitantes Únicos (LGPD)</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono">{metrics.uniqueVisitorsToday}</p>
          <span className="text-[11px] text-slate-400">IPs Anonimizados (SHA-256)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Ofertas Disparadas</span>
            <Activity className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono">{metrics.offersDispatchedToday}</p>
          <span className="text-[11px] text-slate-400">SLA &lt; 60s Mantido</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Comissões Estimadas</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            R$ {metrics.estimatedRevenueTodayBrl.toFixed(2)}
          </p>
          <span className="text-[11px] text-amber-300 font-semibold">{metrics.conversionRatePercent}% Conversão Média</span>
        </div>
      </div>

      {/* Top Offers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-200">Top Ofertas Mais Clicadas do Dia</h2>

        <div className="space-y-3">
          {topOffers.map((off: any) => (
            <div
              key={off.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <span className="px-2 py-0.5 rounded bg-slate-800 font-mono uppercase text-[10px] font-bold text-indigo-400">
                  {off.store}
                </span>
                <h3 className="font-bold text-slate-200 truncate">{off.title}</h3>
                <a
                  href={off.affiliateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:text-indigo-400 flex items-center gap-1 font-mono text-[11px] truncate"
                >
                  {off.affiliateUrl}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div className="flex items-center gap-3 shrink-0 sm:border-l border-slate-800 sm:pl-4">
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Cliques Rastreados</span>
                  <span className="text-base font-black text-indigo-400 font-mono">{off.clicks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Health Monitor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-400" />
          Monitor de Saúde da Infraestrutura
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-bold text-slate-200 block">Oracle VPS Worker</span>
                <span className="text-[10px] text-slate-500">Container Docker</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[10px]">
              {serviceHealth.workerVps}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-bold text-slate-200 block">Supabase Postgres</span>
                <span className="text-[10px] text-slate-500">Transaction Pooler</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[10px]">
              {serviceHealth.supabaseDb}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-bold text-slate-200 block">WhatsApp Socket</span>
                <span className="text-[10px] text-slate-500">Baileys Engine</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[10px]">
              {serviceHealth.whatsappSocket}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
