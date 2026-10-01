'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Sparkles,
  X,
  Send,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { AnalysisResult } from '../types/nutrition';
import { UserProfile } from '../types/user';

interface NutriBotDrawerProps {
  currentProduct?: {
    name: string;
    brand?: string;
    analysis: AnalysisResult;
    ingredients?: string[];
  } | null;
  profile?: UserProfile | null;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Is this safe for diabetes?',
  'Why is this NOVA 4 processed?',
  'Suggest a cleaner healthy swap',
  'Is this safe for young kids?',
  'Explain the gut health score',
];

export const NutriBotDrawer: React.FC<NutriBotDrawerProps> = ({
  currentProduct,
  profile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousProductRef = useRef<string | null>(null);

  // Initialize greeting with context or notify when new product is loaded
  useEffect(() => {
    const greeting = currentProduct
      ? `Hello! I'm NutriBot, your AI Nutrition Copilot. I'm actively analyzing **${currentProduct.name}** (Nutri-Score ${currentProduct.analysis.nutriScore.grade}, NOVA ${currentProduct.analysis.novaGroup}). What dietary, medical, or ingredient questions can I answer for you?`
      : `Hello! I'm NutriBot, your clinical AI Nutritionist. Scan any product or ask me about additives, ultra-processed foods, glycemic index, or clean swaps!`;

    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg_welcome',
          sender: 'bot',
          text: greeting,
          timestamp: 'Just now',
        },
      ]);
      previousProductRef.current = currentProduct?.name || null;
    } else if (currentProduct && currentProduct.name !== previousProductRef.current) {
      // User scanned a new product mid-conversation
      previousProductRef.current = currentProduct.name;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_switched_${Date.now()}`,
          sender: 'bot',
          text: `🔄 **New Food Scanned:** Now analyzing **${currentProduct.name}** (Nutri-Score ${currentProduct.analysis.nutriScore.grade}, NOVA ${currentProduct.analysis.novaGroup}). Ask me anything about its ingredients, additives, or health impact!`,
          timestamp: 'Just now',
        },
      ]);
    }
  }, [currentProduct]);

  const handleResetChat = () => {
    const greeting = currentProduct
      ? `Hello! I'm NutriBot, your AI Nutrition Copilot. I'm actively analyzing **${currentProduct.name}** (Nutri-Score ${currentProduct.analysis.nutriScore.grade}, NOVA ${currentProduct.analysis.novaGroup}). What dietary, medical, or ingredient questions can I answer for you?`
      : `Hello! I'm NutriBot, your clinical AI Nutritionist. Scan any product or ask me about additives, ultra-processed foods, glycemic index, or clean swaps!`;
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        sender: 'bot',
        text: greeting,
        timestamp: 'Just now',
      },
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const prodPayload = currentProduct
        ? {
            productName: currentProduct.name,
            brand: currentProduct.brand,
            grade: currentProduct.analysis.nutriScore.grade,
            novaGroup: currentProduct.analysis.novaGroup,
            calories: currentProduct.analysis.normalizedData.calories_per_100g,
            sugars: currentProduct.analysis.normalizedData.sugars_per_100g,
            sodiumMg: currentProduct.analysis.normalizedData.sodium_mg_per_100g,
            ingredients: currentProduct.ingredients || [],
            additives: currentProduct.analysis.additives.map((a) => a.commonName),
            gutScore: currentProduct.analysis.gut_health_score,
            glycemicLoad: currentProduct.analysis.glycemic_load,
          }
        : undefined;

      const userPayload = profile
        ? {
            isDiabetic: profile.medicalFlags?.isDiabetic,
            hasHypertension: profile.medicalFlags?.hasHypertension,
            isCeliac: profile.medicalFlags?.isCeliac,
            lowSodiumDiet: profile.medicalFlags?.lowSodiumDiet,
          }
        : undefined;

      const res = await fetch('/api/nutribot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          productContext: prodPayload,
          userProfile: userPayload,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Check the ingredient label for whole natural foods!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to communicate with NutriBot:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'bot',
          text: 'I could not reach the clinical server. General advice: Aim for whole foods with under 5g added sugars per serving!',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-tr from-brand-forest via-emerald-600 to-brand-lime text-brand-darkBg font-bold shadow-2xl flex items-center gap-2 border-2 border-brand-lime/40 backdrop-blur-md"
          title="Chat with NutriBot AI Nutritionist"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-brand-darkBg" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <span className="hidden sm:inline text-xs tracking-tight">Ask NutriBot AI</span>
        </motion.button>
      </div>

      {/* CHAT DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md h-full bg-white dark:bg-brand-darkCard shadow-2xl flex flex-col border-l border-slate-200 dark:border-brand-cream/20"
            >
              {/* DRAWER HEADER */}
              <div className="p-4 border-b border-slate-200 dark:border-brand-cream/15 flex items-center justify-between bg-slate-50/70 dark:bg-brand-darkBg/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-gradient-to-tr from-brand-forest to-brand-lime text-brand-darkBg">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>NutriBot Copilot</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-lime/20 text-brand-lime font-bold">
                        AI
                      </span>
                    </h3>
                    <span className="text-[11px] text-slate-400 dark:text-brand-cream/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Clinical Dietary Assistant
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleResetChat}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-brand-darkBg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    title="Reset Conversation"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-brand-darkBg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* CURRENT PRODUCT CONTEXT CHIP */}
              {currentProduct && (
                <div className="px-4 py-2 bg-brand-lime/10 dark:bg-brand-forest/20 border-b border-brand-lime/20 text-[11px] text-brand-forest dark:text-brand-lime flex items-center justify-between">
                  <span className="font-semibold truncate">
                    📍 Analyzing: {currentProduct.name}
                  </span>
                  <span className="font-bold shrink-0 ml-2">
                    Grade {currentProduct.analysis.nutriScore.grade}
                  </span>
                </div>
              )}

              {/* MESSAGES THREAD */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        m.sender === 'user'
                          ? 'bg-brand-forest text-brand-cream rounded-tr-none'
                          : 'bg-slate-100 dark:bg-brand-darkBg text-slate-800 dark:text-brand-cream rounded-tl-none border border-slate-200/50 dark:border-brand-cream/10'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-brand-darkBg text-slate-400 w-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* QUICK PROMPTS */}
              <div className="px-4 py-2 border-t border-slate-200/60 dark:border-brand-cream/10 flex gap-1.5 overflow-x-auto no-scrollbar">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-brand-darkBg hover:bg-brand-lime/10 text-slate-600 dark:text-brand-cream text-[10px] font-medium whitespace-nowrap border border-slate-200 dark:border-brand-cream/15 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* INPUT BAR */}
              <div className="p-3 border-t border-slate-200 dark:border-brand-cream/15 bg-white dark:bg-brand-darkCard">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask about this food, ingredients, or health..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-darkBg border border-slate-200 dark:border-brand-cream/20 text-slate-900 dark:text-white focus:outline-none focus:border-brand-lime"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-brand-lime text-brand-darkBg font-bold hover:bg-brand-lime/90 disabled:opacity-40 transition-all"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <span className="text-[9px] text-slate-400 block text-center mt-1.5">
                  Educational AI dietitian. Not a substitute for medical advice.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
