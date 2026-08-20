'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Database, RefreshCw, CheckCircle2 } from 'lucide-react';

interface OfflineBannerProps {
  isOffline: boolean;
  queuedCount?: number;
  onSyncNow?: () => void;
  isSyncing?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  queuedCount = 0,
  onSyncNow,
  isSyncing = false,
}) => {
  return (
    <AnimatePresence>
      {(isOffline || queuedCount > 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-amber-500/15 dark:bg-amber-500/20 border-b border-amber-500/30 backdrop-blur-xl"
        >
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-2.5 flex items-center justify-between gap-3 text-xs font-semibold text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 rounded-lg bg-amber-500 text-slate-950 shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <span className="truncate">
                {isOffline
                  ? 'Offline Mode Active (Scanning & querying from local IndexedDB cache)'
                  : 'Online — Unsynced offline scans pending'}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {queuedCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  {queuedCount} Queued
                </span>
              )}

              {!isOffline && queuedCount > 0 && onSyncNow && (
                <button
                  onClick={onSyncNow}
                  disabled={isSyncing}
                  className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
