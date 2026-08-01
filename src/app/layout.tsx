import React from 'react';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PromoHub SaaS — Swipe Inbox',
  description: 'Automação, Enriquecimento e Roteamento Inteligente de Ofertas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
