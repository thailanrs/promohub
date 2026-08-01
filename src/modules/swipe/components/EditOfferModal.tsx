'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnrichedOffer } from '../types';
import { X, Save, Sparkles, DollarSign, Tag, Type } from 'lucide-react';

interface EditOfferModalProps {
  offer: EnrichedOffer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOffer: EnrichedOffer) => void;
}

export const EditOfferModal: React.FC<EditOfferModalProps> = ({ offer, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [aiCopy, setAiCopy] = useState('');

  useEffect(() => {
    if (offer) {
      setTitle(offer.title);
      setDiscountedPrice(offer.discountedPrice);
      setOriginalPrice(offer.originalPrice);
      setCouponCode(offer.couponCode || '');
      setAiCopy(offer.aiCopy);
    }
  }, [offer]);

  if (!isOpen || !offer) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Recalculate discount percent if original price exists
    let discountPercent = offer.discountPercent;
    if (originalPrice && originalPrice > 0 && discountedPrice < originalPrice) {
      discountPercent = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
    }

    onSave({
      ...offer,
      title,
      discountedPrice: Number(discountedPrice),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      discountPercent,
      couponCode: couponCode.trim() || null,
      aiCopy,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>✏️ Edição Expressa de Oferta</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-400" /> Título do Produto
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Preço Promocional (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Preço Original (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-slate-600 transition"
                  placeholder="Opcional"
                />
              </div>
            </div>

            {/* Coupon */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Cupom de Desconto
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-amber-400 font-mono uppercase focus:outline-none focus:border-amber-500 transition"
                placeholder="Ex: CUPOM10"
              />
            </div>

            {/* AI Copy */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Copy Gerada por IA
              </label>
              <textarea
                rows={4}
                value={aiCopy}
                onChange={(e) => setAiCopy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                required
              />
            </div>

            {/* Submit */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition"
              >
                <Save className="w-4 h-4" /> Salvar Alterações
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
