'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Share2,
  FileText,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  PackagePlus,
  PackageCheck,
} from 'lucide-react';

import { AnalysisResult, NutriScoreGrade } from '../types/nutrition';
import { addToPantry, isItemInPantry } from '../lib/storage/pantryStore';

interface ExportReportProps {
  analysis: AnalysisResult;
  productName?: string;
}

const GRADE_HEX: Record<NutriScoreGrade, string> = {
  A: '#008B4C',
  B: '#80BB2D',
  C: '#F5C400',
  D: '#E77B00',
  E: '#E63312',
};

export const ExportReport: React.FC<ExportReportProps> = ({
  analysis,
  productName = 'Scanned Product',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [inPantry, setInPantry] = useState(() => isItemInPantry(productName));
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToPantry = () => {
    addToPantry(analysis, productName);
    setInPantry(true);
    showToast(`Added ${productName} to your Pantry!`);
  };

  const { normalizedData: nd, nutriScore, novaGroup, additives } = analysis;

  /**
   * Renders the hidden report card to an offscreen div, captures it,
   * and generates a downloadable PDF.
   */
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const el = reportRef.current;
      if (!el) return;

      // Temporarily make visible for capture
      el.style.position = 'fixed';
      el.style.left = '0';
      el.style.top = '0';
      el.style.zIndex = '-9999';
      el.style.opacity = '1';
      el.style.pointerEvents = 'none';
      el.style.width = '794px'; // A4-ish width

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
      });

      // Reset
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.opacity = '0';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
      pdf.save(`NutriGrade_Report_${productName.replace(/\s+/g, '_')}.pdf`);
      showToast('PDF report generated and downloaded!');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to generate PDF report. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Generates a branded social share card image.
   */
  const handleShareCard = async () => {
    setIsSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const el = reportRef.current;
      if (!el) return;

      el.style.position = 'fixed';
      el.style.left = '0';
      el.style.top = '0';
      el.style.zIndex = '-9999';
      el.style.opacity = '1';
      el.style.pointerEvents = 'none';
      el.style.width = '600px';

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
      });

      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.opacity = '0';

      // Try native share API first (mobile)
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], 'NutriGrade_Card.png', { type: 'image/png' });
          const shareData = {
            title: `NutriGrade AI: ${productName}`,
            text: `${productName} scored Nutri-Score Grade ${nutriScore.grade} (${nutriScore.score} pts). Scanned with NutriGrade AI.`,
            files: [file],
          };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        }

        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NutriGrade_Card_${productName.replace(/\s+/g, '_')}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('Share card error:', err);
    } finally {
      setTimeout(() => setIsSharing(false), 1000);
    }
  };

  const gradeColor = GRADE_HEX[nutriScore.grade];

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 border ${
              toastMessage.type === 'error'
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-emerald-600 text-white border-emerald-400'
            }`}
          >
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Buttons Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExporting ? 'Generating PDF...' : 'Export PDF Report'}
        </button>

        <button
          onClick={handleShareCard}
          disabled={isSharing}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-violet-500/20 hover:shadow-lg transition-all active:scale-95 disabled:opacity-60"
        >
          {isSharing ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          {isSharing ? 'Card Generated!' : 'Share Card'}
        </button>

        <button
          onClick={handleAddToPantry}
          disabled={inPantry}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 ${
            inPantry
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20 hover:shadow-lg'
          }`}
        >
          {inPantry ? (
            <>
              <PackageCheck className="w-4 h-4" />
              <span>Saved in Pantry</span>
            </>
          ) : (
            <>
              <PackagePlus className="w-4 h-4" />
              <span>Add to Pantry</span>
            </>
          )}
        </button>
      </div>

      {/* Hidden Offscreen Report Card (Captured for PDF/Image) */}
      <div
        ref={reportRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          opacity: '0',
          pointerEvents: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '48px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px' }}>
                NutriGrade <span style={{ fontSize: '14px', background: '#10b981', padding: '2px 10px', borderRadius: '20px', marginLeft: '8px' }}>AI</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Clinical Food Nutrition Analysis Report
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'right' }}>
              <div>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          {/* Product Name & Grade Hero */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: gradeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 900,
                color: nutriScore.grade === 'C' ? '#0f172a' : 'white',
                boxShadow: `0 8px 24px ${gradeColor}44`,
                flexShrink: 0,
              }}
            >
              {nutriScore.grade}
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{productName}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Nutri-Score: {nutriScore.grade} ({nutriScore.score} pts) · NOVA Group {novaGroup} · {additives.length} Additive{additives.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Macro Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Energy', value: `${nd.calories_per_100g} kcal`, sub: `${(nd.calories_per_100g * 4.184).toFixed(0)} kJ` },
              { label: 'Sugars', value: `${nd.sugars_per_100g}g`, sub: nd.sugars_per_100g > 15 ? '⚠ High' : '✓ OK' },
              { label: 'Total Fat', value: `${nd.total_fat_per_100g}g`, sub: `Sat: ${nd.saturated_fat_per_100g}g` },
              { label: 'Sodium', value: `${nd.sodium_mg_per_100g}mg`, sub: `Salt: ${(nd.sodium_mg_per_100g / 400).toFixed(2)}g` },
              { label: 'Protein', value: `${nd.protein_per_100g}g`, sub: nd.protein_per_100g >= 8 ? '★ High Protein' : '' },
              { label: 'Fiber', value: `${nd.fiber_per_100g}g`, sub: nd.fiber_per_100g >= 3 ? '★ High Fiber' : '' },
            ].map((m, i) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{m.label}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>{m.value}</div>
                {m.sub && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{m.sub}</div>}
              </div>
            ))}
          </div>

          {/* Nutri-Score Breakdown */}
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
              Nutri-Score Calculation
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div style={{ color: '#f87171' }}>
                N Points: Energy +{nutriScore.negativePoints.energy} · Sugars +{nutriScore.negativePoints.sugars} · Sat Fat +{nutriScore.negativePoints.saturated_fat} · Sodium +{nutriScore.negativePoints.sodium}
              </div>
              <div style={{ color: '#34d399' }}>
                P Points: Fiber -{nutriScore.positivePoints.fiber} · Protein -{nutriScore.positivePoints.protein}
              </div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '8px', color: gradeColor }}>
              Score = {nutriScore.negativePoints.energy + nutriScore.negativePoints.sugars + nutriScore.negativePoints.saturated_fat + nutriScore.negativePoints.sodium} N − {nutriScore.positivePoints.fiber + nutriScore.positivePoints.protein} P = {nutriScore.score}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#475569', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            Report generated by NutriGrade AI · Official Nutri-Score & NOVA Classification · Not medical advice
          </div>
        </div>
      </div>
    </>
  );
};
