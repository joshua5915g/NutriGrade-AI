'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle2, Lock, FileText, Info } from 'lucide-react';

interface MedicalDisclaimerBannerProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const MedicalDisclaimerBanner: React.FC<MedicalDisclaimerBannerProps> = ({
  className = '',
  variant = 'full',
}) => {
  if (variant === 'compact') {
    return (
      <div
        className={`p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-slate-700 dark:text-slate-300 text-xs flex items-start gap-2.5 shadow-sm ${className}`}
        role="region"
        aria-label="Clinical Disclaimer"
      >
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-amber-600 dark:text-amber-400">Informational Only:</strong> NutriGrade provides algorithmic nutritional evaluations based on published scientific standards (Nutri-Score, NOVA, EFSA). It does not provide clinical diagnosis or medical treatment advice. Consult a licensed physician or registered dietitian for personal medical decisions.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl backdrop-blur-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 p-5 md:p-6 shadow-md ${className}`}
      role="region"
      aria-label="Clinical and Regulatory Disclaimer"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
            Clinical &amp; Regulatory Disclaimer
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
              Client Encrypted (Zero Telemetry)
            </span>
          </h4>
          <p>
            ⚠️ <strong className="font-semibold">Informational Only:</strong> NutriGrade provides algorithmic nutritional evaluations based on published scientific standards (Nutri-Score, NOVA, EFSA). It does not provide clinical diagnosis or medical treatment advice. Consult a licensed physician or registered dietitian for personal medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  pendingConditionName?: string;
}

export const MedicalDisclaimerModal: React.FC<MedicalDisclaimerModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  pendingConditionName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDecline}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Clinical Condition Overlay Disclaimer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Required acknowledgment before enabling medical condition filters
                  {pendingConditionName ? ` (${pendingConditionName})` : ''}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
              <p className="font-semibold text-slate-900 dark:text-white">
                ⚠️ Informational Only:
              </p>
              <p>
                NutriGrade provides algorithmic nutritional evaluations based on published scientific standards (Nutri-Score, NOVA, EFSA). It does not provide clinical diagnosis or medical treatment advice. Consult a licensed physician or registered dietitian for personal medical decisions.
              </p>
              <div className="pt-2 border-t border-amber-500/20 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>HIPAA/GDPR Privacy: Medical selections are encrypted on your local device and never sent to any server.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onDecline}
                className="flex-1 py-3 px-4 rounded-2xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={onAccept}
                className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Understand &amp; Agree</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
