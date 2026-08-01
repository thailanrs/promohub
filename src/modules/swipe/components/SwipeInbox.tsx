'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EnrichedOffer } from '../types';
import { SwipeCard } from './SwipeCard';
import { EditOfferModal } from './EditOfferModal';
import { X, Edit3, Send, CheckCircle2, RefreshCw, Layers } from 'lucide-react';

interface SwipeInboxProps {
  initialOffers: EnrichedOffer[];
  onApprove: (offer: EnrichedOffer) => void;
  onReject: (offer: EnrichedOffer) => void;
  onRefresh?: () => void;
}

export const SwipeInbox: React.FC<SwipeInboxProps> = ({
  initialOffers,
  onApprove,
  onReject,
  onRefresh,
}) => {
  const [offers, setOffers] = useState<EnrichedOffer[]>(initialOffers);
  const [editingOffer, setEditingOffer] = useState<EnrichedOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentOffer = offers[0] || null;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentOffer) return;

    const offerToProcess = currentOffer;
    setOffers((prev) => prev.slice(1));

    if (direction === 'right') {
      onApprove(offerToProcess);
    } else {
      onReject(offerToProcess);
    }
  };

  const handleSaveEdit = (updatedOffer: EnrichedOffer) => {
    setOffers((prev) =>
      prev.map((off) => (off.id === updatedOffer.id ? updatedOffer : off))
    );
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[580px] w-full max-w-md mx-auto px-4 py-2">
      {/* Top Status Header */}
      <div className="w-full flex items-center justify-between py-2 border-b border-slate-800/60 mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-300">
            Fila de Aprovação Manual
          </span>
        </div>

        {offers.length > 0 ? (
          <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {offers.length} {offers.length === 1 ? 'pendente' : 'pendentes'}
          </span>
        ) : (
          <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            0 pendentes
          </span>
        )}
      </div>

      {/* Card Stack Area */}
      <div className="relative w-full h-[450px] flex items-center justify-center">
        <AnimatePresence>
          {offers.length > 0 ? (
            offers.slice(0, 2).map((offer, index) => {
              const isFront = index === 0;
              return (
                <SwipeCard
                  key={offer.id}
                  offer={offer}
                  isFront={isFront}
                  onSwipe={handleSwipe}
                />
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full py-12 px-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl text-center space-y-4 shadow-xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-100">
                  Tudo limpo por aqui!
                </h4>
                <p className="text-xs text-slate-400">
                  Todas as ofertas da fila foram aprovadas ou descartadas.
                </p>
              </div>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
                >
                  <RefreshCw className="w-4 h-4" /> Buscar Novas Ofertas
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      {offers.length > 0 && (
        <div className="w-full flex items-center justify-evenly gap-4 mt-6 pt-4 border-t border-slate-800/80">
          {/* Reject Button */}
          <button
            onClick={() => handleSwipe('left')}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white active:scale-90 shadow-lg shadow-rose-500/10 transition"
            title="Descartar (Esquerda)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => {
              setEditingOffer(currentOffer);
              setIsModalOpen(true);
            }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white active:scale-90 shadow-md transition"
            title="Editar Oferta"
          >
            <Edit3 className="w-5 h-5" />
          </button>

          {/* Approve Button */}
          <button
            onClick={() => handleSwipe('right')}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/30 text-white hover:from-emerald-500 hover:to-teal-400 active:scale-90 shadow-lg shadow-emerald-500/25 transition"
            title="Aprovar e Disparar (Direita)"
          >
            <Send className="w-6 h-6 ml-0.5" />
          </button>
        </div>
      )}

      {/* Express Edit Modal */}
      <EditOfferModal
        offer={editingOffer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};
