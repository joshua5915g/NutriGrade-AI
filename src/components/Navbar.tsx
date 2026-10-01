'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Apple,
  Scale,
  Flame,
  UtensilsCrossed,
  PackageCheck,
  ShoppingCart,
  ShieldAlert,
  History,
  Sun,
  Moon,
  Menu,
  X,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

export interface NavbarProps {
  onOpenGuide?: () => void;
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'Scanner', href: '/', icon: ScanLine },
  { name: 'Compare', href: '/compare', icon: Scale },
  { name: 'Daily Fuel', href: '/tracker', icon: Flame, tag: 'Tracker' },
  { name: 'Meal Builder', href: '/meal-builder', icon: UtensilsCrossed },
  { name: 'Pantry', href: '/pantry', icon: PackageCheck },
  { name: 'Lists', href: '/lists', icon: ShoppingCart },
  { name: 'Hall of Shame', href: '/hall-of-shame', icon: ShieldAlert, tag: 'Alert' },
  { name: 'History', href: '/history', icon: History },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenGuide }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme from localStorage / document state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('nutrigrade_theme');
      if (savedTheme) {
        const isDark = savedTheme === 'dark';
        setIsDarkMode(isDark);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const nextState = !isDarkMode;
    setIsDarkMode(nextState);
    if (typeof document !== 'undefined') {
      if (nextState) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('nutrigrade_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('nutrigrade_theme', 'light');
      }
    }
  };

  const currentItem = NAV_ITEMS.find((item) => item.href === pathname) || NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 dark:bg-brand-darkCard/80 border-b border-slate-200/60 dark:border-brand-cream/15 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* LOGO & ACTIVE BADGE */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            title="NutriGrade AI Home"
          >
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-brand-forest to-brand-lime text-brand-darkBg shadow-md shadow-brand-lime/20 group-hover:scale-105 transition-transform">
              <Apple className="w-5 h-5 font-bold" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Nutri<span className="text-brand-lime">Grade</span> AI
              </span>
              {currentItem.tag && (
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-brand-lime/15 text-brand-lime font-bold border border-brand-lime/30 uppercase tracking-wider">
                  {currentItem.tag}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-brand-lime text-brand-darkBg font-bold shadow-md shadow-brand-lime/20'
                    : 'text-slate-600 dark:text-brand-cream/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-brand-forest/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-darkBg' : 'text-brand-lime'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS: THEME TOGGLE & MOBILE MENU TRIGGER */}
        <div className="flex items-center gap-2">
          {/* Guide & How It Works Button */}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="px-3 py-1.5 rounded-full bg-brand-lime/10 hover:bg-brand-lime/20 text-brand-lime font-bold text-xs transition-all border border-brand-lime/30 flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Interactive Guide & How It Works"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
              <span className="hidden sm:inline">How It Works</span>
            </button>
          )}

          {/* Quick Scanner Shortcut when not on home page */}
          {pathname !== '/' && (
            <Link
              href="/"
              className="hidden sm:flex px-3 py-1.5 rounded-full bg-brand-forest/20 hover:bg-brand-forest/30 text-brand-cream font-semibold text-xs transition-all border border-brand-cream/30 items-center gap-1.5"
            >
              <ScanLine className="w-3.5 h-3.5 text-brand-lime" />
              <span>Scan Food</span>
            </Link>
          )}

          {/* Dark Mode Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-brand-darkBg hover:bg-slate-200 dark:hover:bg-brand-forest/40 text-slate-600 dark:text-brand-cream transition-all border border-slate-200/50 dark:border-brand-cream/20"
            aria-label="Toggle theme mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-brand-lime" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-full bg-slate-100 dark:bg-brand-darkBg hover:bg-slate-200 dark:hover:bg-brand-forest/40 text-slate-600 dark:text-brand-cream transition-all border border-slate-200/50 dark:border-brand-cream/20"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-brand-lime" />
            ) : (
              <Menu className="w-5 h-5 text-slate-700 dark:text-brand-cream" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200/60 dark:border-brand-cream/15 bg-white/95 dark:bg-brand-darkCard/95 backdrop-blur-2xl px-4 py-4 space-y-1 shadow-2xl"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-lime text-brand-darkBg font-bold shadow-md'
                      : 'text-slate-700 dark:text-brand-cream/90 hover:bg-slate-100 dark:hover:bg-brand-forest/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-darkBg' : 'text-brand-lime'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.tag && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-forest/20 text-brand-forest dark:text-brand-lime font-bold border border-brand-lime/30">
                      {item.tag}
                    </span>
                  )}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
