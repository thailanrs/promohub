import React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Navigation } from '../components/Navigation';

export const metadata: Metadata = {
  title: 'PromoHub SaaS — Automação de Ofertas & Afiliados',
  description: 'Plataforma SaaS Multi-Tenant de Ingestão, Enriquecimento por IA e Disparo de Ofertas',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col md:flex-row antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navigation />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
