'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { NutriScoreGrade, NovaGroup, AnalysisResult } from '../types/nutrition';
import { isFavorite, toggleFavorite } from '../lib/storage/shoppingLists';

interface FavoriteButtonProps {
  productName: string;
  brand?: string;
  grade: NutriScoreGrade;
  novaGroup: NovaGroup;
  imagePreview?: string;
  analysis?: AnalysisResult;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productName,
  brand,
  grade,
  novaGroup,
  imagePreview,
  analysis,
  className = '',
}) => {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(productName));
  }, [productName]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleFavorite({
      id: productName,
      productName,
      brand,
      grade,
      novaGroup,
      imagePreview,
      analysis,
    });
    setFavorited(newState);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={handleToggle}
      className={`p-2.5 rounded-full transition-all border flex items-center justify-center ${
        favorited
          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-md shadow-rose-500/20'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 border-slate-200 dark:border-slate-700'
      } ${className}`}
      title={favorited ? 'Remove from Favorites' : 'Save to Favorites'}
      aria-label="Toggle Favorite"
    >
      <Heart
        className={`w-4 h-4 transition-all ${
          favorited ? 'fill-rose-500 text-rose-500 scale-110' : ''
        }`}
      />
    </motion.button>
  );
};
