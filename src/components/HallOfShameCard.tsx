'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ThumbsUp,
  Share2,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

import { ShameFeedItem } from '../app/api/hall-of-shame/route';
import { NutriScoreGrade } from '../types/nutrition';

interface HallOfShameCardProps {
  item: ShameFeedItem;
  onUpvote?: (id: string) => void;
}

const GRADE_HEX: Record<NutriScoreGrade, string> = {
  A: '#008B4C',
  B: '#80BB2D',
  C: '#F5C400',
  D: '#E77B00',
  E: '#E63312',
};

const GRADE_BG_CLASS: Record<NutriScoreGrade, string> = {
  A: 'bg-[#008B4C] text-white',
  B: 'bg-[#80BB2D] text-white',
  C: 'bg-[#F5C400] text-slate-900',
  D: 'bg-[#E77B00] text-white',
  E: 'bg-[#E63312] text-white',
};

export const HallOfShameCard: React.FC<HallOfShameCardProps> = ({
  item,
  onUpvote,
}) => {
  const [upvotes, setUpvotes] = useState(item.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleUpvoteClick = async () => {
    if (hasUpvoted) return;
    setUpvotes(upvotes + 1);
    setHasUpvoted(true);

    if (onUpvote) {
      onUpvote(item.id);
    } else {
      try {
        await fetch('/api/hall-of-shame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'upvote', id: item.id }),
        });
      } catch (err) {
        console.error('Upvote error:', err);
      }
    }
  };

  const handleShare = async () => {
    const shareText = `🚨 Greenwashing Alert! "${item.productName}" claims "${item.frontClaim}", but actual grade is Grade ${item.actualGrade} (${item.actualDetails}). Flagged with ${item.discrepancyScore}% Misleading Score on NutriGrade AI Hall of Shame!`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Greenwashing Alert: ${item.productName}`,
          text: shareText,
          url: typeof window !== 'undefined' ? window.location.href : '',
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    // Clipboard fallback
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard write prevented:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const shareText = `🚨 *Greenwashing Alert!* \n\n*Product:* ${item.productName}\n*Front Claim:* "${item.frontClaim}"\n*Reality Check:* Grade ${item.actualGrade} (${item.actualDetails})\n*Discrepancy Severity:* ${item.discrepancyScore}% Misleading\n\nExposed on NutriGrade AI Hall of Shame!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-rose-500/20 dark:border-rose-900/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-5 group"
    >
      {/* Top Discrepancy Severity Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{item.discrepancyScore}% Misleading Score</span>
        </div>

        <div
          className={`w-9 h-9 rounded-xl ${GRADE_BG_CLASS[item.actualGrade]} flex items-center justify-center font-black text-sm shadow-md shrink-0`}
        >
          {item.actualGrade}
        </div>
      </div>

      {/* Product Name */}
      <div className="space-y-1">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-rose-500 transition-colors">
          {item.productName}
        </h3>
        {item.submittedAt && (
          <span className="text-[10px] text-slate-400 font-mono">
            Exposed on {new Date(item.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* 2-Box Comparison: Front Marketing vs Back Reality */}
      <div className="space-y-2.5">
        {/* Box 1: Front Marketing Claim */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            📣 Front Package Claim
          </span>
          <p className="text-xs font-semibold text-amber-950 dark:text-amber-100 italic">
            "{item.frontClaim}"
          </p>
        </div>

        {/* Box 2: Back Reality Check */}
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
            🔬 Back Label Reality Check
          </span>
          <p className="text-xs font-bold text-rose-950 dark:text-rose-100">
            Actual Nutri-Score Grade {item.actualGrade}
          </p>
          <p className="text-[11px] text-rose-800/90 dark:text-rose-200/90">
            {item.actualDetails}
          </p>
        </div>
      </div>

      {item.backFacts && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic">
          {item.backFacts}
        </p>
      )}

      {/* Action Footer: Upvotes + Social Share Buttons */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
        <button
          onClick={handleUpvoteClick}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            hasUpvoted
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-white' : ''}`} />
          <span>{upvotes}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleWhatsAppShare}
            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all font-semibold text-xs flex items-center gap-1"
            title="Share to WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all font-bold text-xs flex items-center gap-1.5"
          >
            {isCopied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
