'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { EnrichedOffer } from '../types';
import { Sparkles, Tag, Check, Copy, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';

interface SwipeCardProps {
  offer: EnrichedOffer;
  onSwipe: (direction: 'left' | 'right') => void;
  isFront: boolean;
}

export const STORE_LABEL_MAP: Record<EnrichedOffer['store'], { name: string; color: string }> = {
  amazon: { name: 'Amazon', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  shopee: { name: 'Shopee', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  mercadolivre: { name: 'Mercado Livre', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  magalu: { name: 'Magalu', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'ali-express': { name: 'AliExpress', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  other: { name: 'Oferta', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
};

export const SwipeCard: React.FC<SwipeCardProps> = ({ offer, onSwipe, isFront }) => {
  const [copied, setCopied] = useState(false);
  const x = useMotionValue(0);

  // Rotation based on drag position
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);

  // Opacity indicators for swipe right (Approve) and swipe left (Reject)
  const approveOpacity = useTransform(x, [20, 120], [0, 1]);
  const rejectOpacity = useTransform(x, [-120, -20], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!isFront) return;

    if (info.offset.x > 100 || info.velocity.x > 500) {
      onSwipe('right');
    } else if (info.offset.x < -100 || info.velocity.x < -500) {
      onSwipe('left');
    }
  };

  const copyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (offer.couponCode) {
      navigator.clipboard.writeText(offer.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const storeInfo = STORE_LABEL_MAP[offer.store] || STORE_LABEL_MAP.other;

  const formattedDiscounted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(offer.discountedPrice);

  const formattedOriginal = offer.originalPrice
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(offer.originalPrice)
    : null;

  return (
    <motion.div
      style={{
        x: isFront ? x : 0,
        rotate: isFront ? rotate : 0,
        touchAction: 'none',
      }}
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={{ scale: isFront ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`absolute top-0 left-0 right-0 w-full rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing transition-shadow ${
        isFront ? 'z-20 shadow-emerald-500/5' : 'z-10 opacity-75'
      }`}
    >
      {/* Swipe Overlay Indicators */}
      {isFront && (
        <>
          <motion.div
            style={{ opacity: approveOpacity }}
            className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/90 text-white font-extrabold text-lg border-2 border-emerald-300 shadow-lg pointer-events-none rotate-[-12deg]"
          >
            <ThumbsUp className="w-6 h-6" /> APROVAR
          </motion.div>

          <motion.div
            style={{ opacity: rejectOpacity }}
            className="absolute top-6 right-6 z-30 flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-600/90 text-white font-extrabold text-lg border-2 border-rose-300 shadow-lg pointer-events-none rotate-[12deg]"
          >
            <ThumbsDown className="w-6 h-6" /> DESCARTAR
          </motion.div>
        </>
      )}

      {/* Product Image & Badges */}
      <div className="relative h-48 sm:h-56 w-full bg-slate-950/80 flex items-center justify-center p-3 overflow-hidden rounded-t-3xl">
        <img
          src={offer.imageUrl}
          alt={offer.title}
          className="h-full w-full object-contain drop-shadow-md rounded-xl"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${storeInfo.color}`}>
            {storeInfo.name}
          </span>
          {offer.discountPercent > 0 && (
            <span className="px-3 py-1 text-xs font-black rounded-full bg-emerald-500 text-slate-950 shadow-md">
              -{offer.discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 className="text-base font-bold text-slate-100 line-clamp-2 leading-snug">
          {offer.title}
        </h3>

        {/* Pricing & Coupon */}
        <div className="flex items-end justify-between gap-2">
          <div>
            {formattedOriginal && (
              <span className="text-xs text-slate-400 line-through mr-2">
                De {formattedOriginal}
              </span>
            )}
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              Por {formattedDiscounted}
            </div>
          </div>

          {offer.couponCode && (
            <button
              onClick={copyCoupon}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 active:scale-95 transition"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{offer.couponCode}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* AI Copy Preview */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Copy Gerada por IA</span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line">
            {offer.aiCopy}
          </p>
        </div>

        {/* Destination link preview */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <span>Shortcode: /{offer.shortCode}</span>
          <a
            href={offer.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-indigo-400 hover:underline"
          >
            <span>Ver Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
