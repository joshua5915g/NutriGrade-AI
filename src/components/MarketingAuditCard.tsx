'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertTriangle,
  XOctagon,
  Eye,
  CheckCircle2,
  Sparkles,
  Flame,
} from 'lucide-react';

export interface MarketingClaim {
  claim: string;
  status: 'VERIFIED' | 'MISLEADING' | 'FALSE';
  explanation: string;
}

interface MarketingAuditCardProps {
  claims: MarketingClaim[];
}

export const MarketingAuditCard: React.FC<MarketingAuditCardProps> = ({
  claims,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!claims || claims.length === 0) return null;

  const verifiedCount = claims.filter((c) => c.status === 'VERIFIED').length;
  const misleadingCount = claims.filter((c) => c.status === 'MISLEADING').length;
  const falseCount = claims.filter((c) => c.status === 'FALSE').length;

  const overallSafe = misleadingCount === 0 && falseCount === 0;

  const getStatusConfig = (status: MarketingClaim['status']) => {
    switch (status) {
      case 'VERIFIED':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          badge: 'VERIFIED',
          badgeClass:
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          cardBg:
            'bg-emerald-500/5 border-emerald-500/20',
          textClass: 'text-emerald-950 dark:text-emerald-100',
        };
      case 'MISLEADING':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          badge: 'MISLEADING',
          badgeClass:
            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          cardBg:
            'bg-amber-500/5 border-amber-500/20',
          textClass: 'text-amber-950 dark:text-amber-100',
        };
      case 'FALSE':
        return {
          icon: <XOctagon className="w-5 h-5 text-rose-500 shrink-0" />,
          badge: 'FALSE CLAIM',
          badgeClass:
            'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          cardBg:
            'bg-rose-500/5 border-rose-500/20',
          textClass: 'text-rose-950 dark:text-rose-100',
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-xl space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-500">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Dual-Scan Cross-Verification Audit
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">
                Front vs. Back
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each front-of-package marketing claim verified against actual nutrition facts
            </p>
          </div>
        </div>

        {/* Summary Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            overallSafe
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}
        >
          {overallSafe ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          <span>
            {verifiedCount} Verified · {misleadingCount} Misleading · {falseCount} False
          </span>
        </div>
      </div>

      {/* Counter Pills Row */}
      <div className="flex flex-wrap gap-2">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          ✓ {verifiedCount} Verified
        </span>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          ⚠ {misleadingCount} Misleading
        </span>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          ✕ {falseCount} False
        </span>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {claims.map((claim, idx) => {
          const config = getStatusConfig(claim.status);
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.3 }}
              className={`p-4 rounded-2xl border flex items-start gap-4 transition-all hover:shadow-md ${config.cardBg}`}
            >
              <div className="mt-0.5">{config.icon}</div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold text-sm ${config.textClass}`}>
                    {claim.claim}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${config.badgeClass}`}
                  >
                    {config.badge}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed opacity-90 ${config.textClass}`}
                >
                  {claim.explanation}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expose to Hall of Shame Trigger (High Discrepancy Flag) */}
      {!overallSafe && (
        <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between gap-4">
          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            🚨 Discrepancy Flagged: Packaging claims contradict actual nutritional data.
          </div>
          <button
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const firstFlawed = claims.find((c) => c.status !== 'VERIFIED') || claims[0];
                await fetch('/api/hall-of-shame', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'submit',
                    productName: 'Audited Product Packaging',
                    frontClaim: firstFlawed.claim,
                    actualGrade: 'E',
                    actualDetails: firstFlawed.explanation,
                    discrepancyScore: 92,
                  }),
                });
              } catch (e) {
                // ignore
              } finally {
                setIsSubmitting(false);
                router.push('/hall-of-shame');
              }
            }}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 shrink-0"
          >
            <Flame className="w-4 h-4" />
            <span>{isSubmitting ? 'Exposing...' : 'Expose to Hall of Shame'}</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
