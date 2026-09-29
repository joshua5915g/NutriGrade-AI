'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Share2,
  Copy,
  Sparkles,
  Check,
  Smartphone,
  Square,
  Instagram,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Leaf,
  Activity,
  Award,
} from 'lucide-react';
import { AnalysisResult, NutriScoreGrade } from '../types/nutrition';
import { GreenwashingResult } from '../lib/algorithms/greenwashingDetector';

interface SocialNutriCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  analysis: AnalysisResult;
  greenwashingResult?: GreenwashingResult | null;
}

type CardFormat = 'story' | 'square';
type ThemeMode = 'dark' | 'sunset' | 'clean';

const GRADE_COLORS: Record<NutriScoreGrade, { bg: string; text: string; glow: string; hex: string }> = {
  A: { bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.4)', hex: '#10b981' },
  B: { bg: 'bg-lime-500', text: 'text-lime-400', glow: 'rgba(132, 204, 22, 0.4)', hex: '#84cc16' },
  C: { bg: 'bg-amber-500', text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.4)', hex: '#f59e0b' },
  D: { bg: 'bg-orange-500', text: 'text-orange-400', glow: 'rgba(249, 115, 22, 0.4)', hex: '#f97316' },
  E: { bg: 'bg-rose-600', text: 'text-rose-400', glow: 'rgba(225, 29, 72, 0.4)', hex: '#e11d48' },
};

export const SocialNutriCardModal: React.FC<SocialNutriCardModalProps> = ({
  isOpen,
  onClose,
  productName,
  analysis,
  greenwashingResult,
}) => {
  const [format, setFormat] = useState<CardFormat>('story');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const { normalizedData: nd, nutriScore, novaGroup } = analysis;
  const gradeConfig = GRADE_COLORS[nutriScore.grade] || GRADE_COLORS.C;

  const themeStyles: Record<ThemeMode, { container: string; text: string; subtext: string; cardBg: string }> = {
    dark: {
      container: 'bg-gradient-to-br from-slate-950 via-slate-900 to-black',
      text: 'text-white',
      subtext: 'text-slate-400',
      cardBg: 'bg-white/5 border-white/10',
    },
    sunset: {
      container: 'bg-gradient-to-br from-violet-950 via-purple-900 to-slate-950',
      text: 'text-white',
      subtext: 'text-purple-300',
      cardBg: 'bg-white/10 border-white/15',
    },
    clean: {
      container: 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950',
      text: 'text-white',
      subtext: 'text-emerald-300',
      cardBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  };

  const currentTheme = themeStyles[theme];

  // Capture the DOM node and trigger PNG download
  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `nutrigrade-${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${format}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate PNG:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Trigger Native Web Share API on mobile
  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `${productName}-nutrigrade.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `NutriGrade AI: ${productName}`,
            text: `${productName} scored Nutri-Score ${nutriScore.grade} & NOVA ${novaGroup} on NutriGrade AI! Check your food intelligence.`,
            files: [file],
          });
        } else if (navigator.share) {
          await navigator.share({
            title: `NutriGrade AI: ${productName}`,
            text: `${productName} scored Nutri-Score ${nutriScore.grade} & NOVA ${novaGroup} on NutriGrade AI!`,
            url: window.location.href,
          });
        } else {
          handleDownloadPNG();
        }
      });
    } catch (err) {
      console.warn('Share dismissed or unsupported:', err);
    }
  };

  // Copy shareable summary text to clipboard
  const handleCopyText = () => {
    const text = `🥗 NutriGrade AI Scan Result:
📦 Product: ${productName}
🏆 Nutri-Score: Grade ${nutriScore.grade} (${nutriScore.score} pts)
⚙️ Processing: NOVA Group ${novaGroup} (${novaGroup === 4 ? 'Ultra-Processed' : 'Natural/Whole Food'})
🍬 Sugar: ${nd.sugars_per_100g}g / 100g
🧂 Sodium: ${nd.sodium_mg_per_100g}mg / 100g
🥦 Fiber: ${nd.fiber_per_100g}g / 100g
Scanned with NutriGrade AI`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-auto"
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Social NutriCard Studio
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Feature 10
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate high-res Instagram Story & WhatsApp food report cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS: FORMAT & THEME */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Format selector */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-800/80 border border-slate-700">
            <button
              onClick={() => setFormat('story')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                format === 'story'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>9:16 Story</span>
            </button>
            <button
              onClick={() => setFormat('square')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                format === 'square'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Square className="w-4 h-4" />
              <span>1:1 Square</span>
            </button>
          </div>

          {/* Theme selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold mr-1">Theme:</span>
            {(['dark', 'sunset', 'clean'] as ThemeMode[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                  theme === t
                    ? 'bg-white/20 text-white border border-white/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* CARD PREVIEW VIEWPORT */}
        <div className="flex justify-center items-center py-2 overflow-hidden">
          <div
            ref={cardRef}
            style={{
              boxShadow: `0 20px 50px -10px ${gradeConfig.glow}`,
            }}
            className={`w-full transition-all rounded-3xl p-6 md:p-8 border relative overflow-hidden flex flex-col justify-between ${
              currentTheme.container
            } ${
              format === 'story'
                ? 'max-w-[340px] aspect-[9/16] min-h-[560px]'
                : 'max-w-[400px] aspect-square min-h-[400px]'
            }`}
          >
            {/* AMBIENT GLOW CIRCLE */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: gradeConfig.hex }}
            />

            {/* TOP BAR: BRANDMARK & VERIFIED BADGE */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-sm">
                  N
                </div>
                <span className="font-black text-sm tracking-tight text-white">
                  NutriGrade<span className="text-emerald-400">.AI</span>
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 font-bold border border-white/10 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Scan
              </span>
            </div>

            {/* PRODUCT NAME & TAG */}
            <div className="my-3 z-10">
              <h3 className="text-2xl font-black tracking-tight text-white line-clamp-2 leading-snug">
                {productName}
              </h3>
              {greenwashingResult && greenwashingResult.claims.some((c) => c.isMisleading) ? (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  Marketing Audit: {greenwashingResult.claims.find((c) => c.isMisleading)?.claim || 'Deceptive Label'} Expose
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  <Award className="w-3 h-3" />
                  Algorithmic Clinical Intelligence
                </div>
              )}
            </div>

            {/* HERO SCORES: NUTRI-SCORE & NOVA */}
            <div className="grid grid-cols-2 gap-3 my-2 z-10">
              {/* Nutri-Score Card */}
              <div className={`p-4 rounded-2xl ${currentTheme.cardBg} backdrop-blur-md flex flex-col items-center justify-center text-center`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nutri-Score
                </span>
                <div
                  className={`w-14 h-14 rounded-2xl ${gradeConfig.bg} text-white flex items-center justify-center font-black text-3xl shadow-xl`}
                >
                  {nutriScore.grade}
                </div>
                <span className="text-[11px] font-bold text-slate-300 mt-2">
                  {nutriScore.score} points
                </span>
              </div>

              {/* NOVA Processing Card */}
              <div className={`p-4 rounded-2xl ${currentTheme.cardBg} backdrop-blur-md flex flex-col items-center justify-center text-center`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Processing
                </span>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl ${
                    novaGroup === 4
                      ? 'bg-rose-500 text-white'
                      : novaGroup === 1
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  NOVA {novaGroup}
                </div>
                <span className="text-[11px] font-bold text-slate-300 mt-2 truncate max-w-full">
                  {novaGroup === 4 ? 'Ultra-Processed' : novaGroup === 1 ? 'Whole Food' : 'Processed'}
                </span>
              </div>
            </div>

            {/* KEY MACRO TILES */}
            <div className="grid grid-cols-3 gap-2 my-2 z-10">
              <div className={`p-2.5 rounded-xl ${currentTheme.cardBg} text-center`}>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Sugar</span>
                <span className={`text-sm font-black ${nd.sugars_per_100g > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {nd.sugars_per_100g}g
                </span>
              </div>
              <div className={`p-2.5 rounded-xl ${currentTheme.cardBg} text-center`}>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Sodium</span>
                <span className={`text-sm font-black ${nd.sodium_mg_per_100g > 400 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {nd.sodium_mg_per_100g}mg
                </span>
              </div>
              <div className={`p-2.5 rounded-xl ${currentTheme.cardBg} text-center`}>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Fiber</span>
                <span className="text-sm font-black text-emerald-400">
                  {nd.fiber_per_100g}g
                </span>
              </div>
            </div>

            {/* FOOTER WATERMARK */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 z-10">
              <span>Scan any food on nutrigrade.ai</span>
              <span className="font-mono">#KnowWhatYouEat</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Text!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Card</span>
            </button>
          </div>

          <button
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-lg transition-all active:scale-95 disabled:opacity-50 ml-auto"
          >
            {isDownloading ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isDownloading ? 'Exporting 2x PNG...' : 'Download High-Res PNG'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
