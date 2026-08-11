'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Package,
  Zap,
  ShieldAlert,
} from 'lucide-react';

import { AnalysisResult, NutriScoreGrade } from '../types/nutrition';

/** Raw item shape returned by the /api/analyze-batch endpoint */
export interface BatchDetectedItem {
  item_id: string;
  product_name: string;
  /** Normalized [ymin, xmin, ymax, xmax] each in 0–1 range */
  bounding_box: [number, number, number, number];
  analysis: AnalysisResult;
}

interface MultiItemBatchViewerProps {
  imageUrl: string;
  items: BatchDetectedItem[];
  onSelectItem?: (item: BatchDetectedItem) => void;
}

const GRADE_COLORS: Record<NutriScoreGrade, { stroke: string; fill: string; bg: string; text: string }> = {
  A: { stroke: '#10b981', fill: 'rgba(16,185,129,0.12)', bg: 'bg-emerald-500', text: 'text-white' },
  B: { stroke: '#80BB2D', fill: 'rgba(128,187,45,0.12)', bg: 'bg-lime-500', text: 'text-white' },
  C: { stroke: '#F5C400', fill: 'rgba(245,196,0,0.15)', bg: 'bg-yellow-400', text: 'text-slate-900' },
  D: { stroke: '#E77B00', fill: 'rgba(231,123,0,0.12)', bg: 'bg-orange-500', text: 'text-white' },
  E: { stroke: '#E63312', fill: 'rgba(230,51,18,0.12)', bg: 'bg-rose-500', text: 'text-white' },
};

export const MultiItemBatchViewer: React.FC<MultiItemBatchViewerProps> = ({
  imageUrl,
  items,
  onSelectItem,
}) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Observe container size changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeItem = items.find(
    (i) => i.item_id === (selectedItemId || hoveredItemId)
  );

  const handleBoxClick = (item: BatchDetectedItem) => {
    setSelectedItemId(selectedItemId === item.item_id ? null : item.item_id);
    onSelectItem?.(item);
  };

  return (
    <div className="space-y-4">
      {/* Item Count Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-violet-500/10 text-violet-500">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Multi-Item Detection
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {items.length} product{items.length !== 1 ? 's' : ''} detected — click a box for details
            </p>
          </div>
        </div>

        {/* Grade Legend */}
        <div className="hidden sm:flex items-center gap-1.5">
          {(['A', 'B', 'C', 'D', 'E'] as const).map((g) => (
            <span
              key={g}
              className={`w-5 h-5 rounded-md ${GRADE_COLORS[g].bg} ${GRADE_COLORS[g].text} text-[9px] font-black flex items-center justify-center`}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Image + Bounding Box Overlay Container */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-xl bg-slate-900">
        <div ref={containerRef} className="relative w-full">
          {/* Base Image */}
          <img
            src={imageUrl}
            alt="Multi-item scan"
            className="w-full h-auto block"
            draggable={false}
          />

          {/* SVG Bounding Box Overlay */}
          {containerSize.width > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
              preserveAspectRatio="none"
            >
              {items.map((item) => {
                const [ymin, xmin, ymax, xmax] = item.bounding_box;
                const grade = item.analysis.nutriScore.grade;
                const colors = GRADE_COLORS[grade];
                const isActive =
                  item.item_id === hoveredItemId || item.item_id === selectedItemId;

                const x = xmin * containerSize.width;
                const y = ymin * containerSize.height;
                const w = (xmax - xmin) * containerSize.width;
                const h = (ymax - ymin) * containerSize.height;

                return (
                  <g key={item.item_id} className="pointer-events-auto cursor-pointer">
                    {/* Filled background */}
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={isActive ? colors.fill : 'transparent'}
                      rx={8}
                      className="transition-all duration-200"
                    />

                    {/* Border */}
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill="none"
                      stroke={colors.stroke}
                      strokeWidth={isActive ? 3.5 : 2}
                      rx={8}
                      className="transition-all duration-200"
                      onMouseEnter={() => setHoveredItemId(item.item_id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                      onClick={() => handleBoxClick(item)}
                    />

                    {/* Grade Badge (top-left corner) */}
                    <rect
                      x={x}
                      y={y}
                      width={28}
                      height={22}
                      fill={colors.stroke}
                      rx={6}
                    />
                    <text
                      x={x + 14}
                      y={y + 15}
                      textAnchor="middle"
                      fill={grade === 'C' ? '#0f172a' : 'white'}
                      fontSize="12"
                      fontWeight="900"
                      fontFamily="system-ui, sans-serif"
                    >
                      {grade}
                    </text>

                    {/* Product Name Label (bottom) */}
                    <rect
                      x={x}
                      y={y + h - 22}
                      width={Math.min(w, 180)}
                      height={22}
                      fill="rgba(0,0,0,0.7)"
                      rx={4}
                    />
                    <text
                      x={x + 6}
                      y={y + h - 7}
                      fill="white"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="system-ui, sans-serif"
                    >
                      {item.product_name.length > 22
                        ? item.product_name.slice(0, 22) + '…'
                        : item.product_name}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Floating Detail Card (appears on click/hover) */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            key={activeItem.item_id}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="rounded-3xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-2xl space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${GRADE_COLORS[activeItem.analysis.nutriScore.grade].bg} ${GRADE_COLORS[activeItem.analysis.nutriScore.grade].text} flex items-center justify-center font-black text-sm shadow-md`}
                >
                  {activeItem.analysis.nutriScore.grade}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeItem.product_name}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Nutri-Score {activeItem.analysis.nutriScore.grade} ({activeItem.analysis.nutriScore.score} pts) · NOVA {activeItem.analysis.novaGroup}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemId(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Macro Row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Energy', value: `${activeItem.analysis.normalizedData.calories_per_100g} kcal` },
                { label: 'Sugars', value: `${activeItem.analysis.normalizedData.sugars_per_100g}g` },
                { label: 'Fat', value: `${activeItem.analysis.normalizedData.total_fat_per_100g}g` },
                { label: 'Sodium', value: `${activeItem.analysis.normalizedData.sodium_mg_per_100g}mg` },
              ].map((m) => (
                <div key={m.label} className="text-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40">
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">{m.label}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white block">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Health Warnings */}
            {activeItem.analysis.healthWarnings.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-xs text-rose-600 dark:text-rose-400">
                  {activeItem.analysis.healthWarnings.join(' · ')}
                </span>
              </div>
            )}

            {/* Quick Summary */}
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {activeItem.analysis.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Chips Row (all items) */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const grade = item.analysis.nutriScore.grade;
          const isSelected = item.item_id === selectedItemId;
          const colors = GRADE_COLORS[grade];

          return (
            <button
              key={item.item_id}
              onClick={() => handleBoxClick(item)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? `${colors.bg} ${colors.text} border-transparent shadow-md`
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200/40 dark:border-slate-700/40 hover:shadow-sm'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md ${colors.bg} ${colors.text} text-[9px] font-black flex items-center justify-center shrink-0`}
              >
                {grade}
              </span>
              <span className="truncate max-w-[120px]">{item.product_name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
