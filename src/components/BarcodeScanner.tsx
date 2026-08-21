'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Barcode,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  isSearching?: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeDetected,
  isSearching = false,
}) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);

  // Preset Barcodes for Instant Open Food Facts testing
  const PRESET_BARCODES = [
    { name: 'Nutella Hazelnut Spread', code: '3017620422003' },
    { name: 'Coca-Cola Original Soda', code: '5449000000996' },
    { name: 'Evian Natural Mineral Water', code: '3075020040500' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualBarcode.trim().replace(/\D/g, '');
    if (!clean || clean.length < 8) {
      setScanError('Please enter a valid 8 to 13 digit EAN/UPC barcode.');
      return;
    }
    setScanError(null);
    onBarcodeDetected(clean);
  };

  const handleSelectPreset = (code: string) => {
    setManualBarcode(code);
    setScanError(null);
    onBarcodeDetected(code);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Barcode className="w-4 h-4 text-emerald-500" />
          Direct Regulatory Barcode Lookup
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
          Instant Verification (&lt;100ms)
        </span>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Enter EAN-13 or UPC Barcode (e.g., 3017620422003)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          {isSearching ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          <span>Query</span>
        </button>
      </form>

      {/* Preset Chips */}
      <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
        <span className="text-slate-400 text-[11px]">Quick Barcode Demos:</span>
        {PRESET_BARCODES.map((preset) => (
          <button
            key={preset.code}
            type="button"
            onClick={() => handleSelectPreset(preset.code)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-all active:scale-95 flex items-center gap-1"
          >
            <Barcode className="w-3 h-3 text-emerald-500" />
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      {scanError && (
        <div className="text-[11px] text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{scanError}</span>
        </div>
      )}
    </div>
  );
};
