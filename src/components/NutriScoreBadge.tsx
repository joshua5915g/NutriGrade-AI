'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NutriScoreGrade } from '../types/nutrition';

interface NutriScoreBadgeProps {
  grade: NutriScoreGrade;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

interface GradeConfig {
  letter: NutriScoreGrade;
  label: string;
  bgColor: string;
  activeBorder: string;
  shadowColor: string;
  textColor: string;
}

const GRADES: GradeConfig[] = [
  {
    letter: 'A',
    label: 'Very Good Nutritional Quality',
    bgColor: 'bg-[#008B4C]',
    activeBorder: 'border-[#008B4C]',
    shadowColor: 'shadow-[#008B4C]/50',
    textColor: 'text-white',
  },
  {
    letter: 'B',
    label: 'Good Nutritional Quality',
    bgColor: 'bg-[#80BB2D]',
    activeBorder: 'border-[#80BB2D]',
    shadowColor: 'shadow-[#80BB2D]/50',
    textColor: 'text-white',
  },
  {
    letter: 'C',
    label: 'Average Nutritional Quality',
    bgColor: 'bg-[#FECB02]',
    activeBorder: 'border-[#FECB02]',
    shadowColor: 'shadow-[#FECB02]/50',
    textColor: 'text-slate-950', // Yellow requires dark text for high contrast accessibility
  },
  {
    letter: 'D',
    label: 'Poor Nutritional Quality',
    bgColor: 'bg-[#EE8100]',
    activeBorder: 'border-[#EE8100]',
    shadowColor: 'shadow-[#EE8100]/50',
    textColor: 'text-white',
  },
  {
    letter: 'E',
    label: 'Unhealthy Nutritional Quality',
    bgColor: 'bg-[#E63312]',
    activeBorder: 'border-[#E63312]',
    shadowColor: 'shadow-[#E63312]/50',
    textColor: 'text-white',
  },
];

export const NutriScoreBadge: React.FC<NutriScoreBadgeProps> = ({
  grade,
  score,
  size = 'md',
}) => {
  const normalizedGrade = (grade?.toUpperCase() as NutriScoreGrade) || 'C';

  // Size styling maps
  const containerSizeClasses = {
    sm: 'p-1.5 gap-1 rounded-xl',
    md: 'p-2 gap-1.5 rounded-2xl',
    lg: 'p-3 gap-2 rounded-3xl',
  };

  const pillSizeClasses = {
    sm: 'w-7 h-9 text-xs rounded-lg font-bold',
    md: 'w-10 h-12 text-base rounded-xl font-black',
    lg: 'w-14 h-16 text-xl rounded-2xl font-black',
  };

  return (
    <div className="inline-flex flex-col items-center">
      {/* Outer Glassmorphic Container */}
      <div
        className={`inline-flex items-center bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-lg ${containerSizeClasses[size]}`}
        role="region"
        aria-label={`Nutri-Score Rating ${normalizedGrade}`}
        title="Official European Standard (Santé Publique France)"
      >
        {GRADES.map((g) => {
          const isActive = g.letter === normalizedGrade;

          return (
            <div key={g.letter} className="relative">
              {/* Individual Grade Pill */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 0.92,
                  opacity: isActive ? 1 : 0.45,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`relative flex items-center justify-center transition-all ${
                  pillSizeClasses[size]
                } ${g.bgColor} ${g.textColor} ${
                  isActive ? `shadow-xl ${g.shadowColor} z-10 ring-2 ring-white/50` : ''
                }`}
                title={`${g.letter}: ${g.label}`}
              >
                <span>{g.letter}</span>
              </motion.div>

              {/* Active Indicator Chevron/Dot */}
              {isActive && (
                <motion.div
                  layoutId="activePillIndicator"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Optional Numerical Score Badge */}
      {score !== undefined && (
        <span className="mt-3 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          Score: <span className="font-mono text-slate-900 dark:text-slate-100">{score}</span>
        </span>
      )}
    </div>
  );
};
