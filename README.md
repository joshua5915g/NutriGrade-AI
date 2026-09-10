# NutriGrade AI 🥗⚡
### Next-Gen AI Food Intelligence, Clinical Grading & Greenwashing Detection Engine

[![Next.js](https://img.shields.io/badge/Next.js-14_(App_Router)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?style=flat-square&logo=google-gemini)](https://ai.google.dev/)
[![Offline PWA](https://img.shields.io/badge/PWA-IndexedDB_Offline_Ready-success?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## 📖 Overview

**NutriGrade AI** is a state-of-the-art food intelligence and nutrition transparency web application. It bridges the gap between confusing food labels, deceptive front-of-package marketing claims ("greenwashing"), and true clinical biological impact.

Powered by **Google Gemini 1.5 Flash Vision AI**, **Open Food Facts API**, and proprietary deterministic health algorithms, NutriGrade AI transforms packaging photos or barcodes into comprehensive nutritional grades, gut health assessments, glycemic impact forecasts, and regulatory hazard reports.

---

## ✨ Key Features & Capabilities

### 1. 🔍 Multimodal Scanning & Ingestion Pipeline
- **Barcode Scanner**: Instant sub-100ms barcode recognition using `@zxing/browser` integrated directly with the Open Food Facts global database.
- **Multimodal Vision AI OCR**: Upload or capture photos of nutrition panels; Google Gemini 1.5 Flash automatically extracts and structures macro/micronutrients and ingredients.
- **Client-Side Image Optimization**: High-efficiency canvas preprocessing, image rotation correction, and compression before network dispatch.
- **Dual-Scan Cross-Verification Audit**: Simultaneously scans the **Front** (marketing claims) and **Back** (nutrition facts & ingredients) of packaging to detect deceptive advertising.
- **Multi-Item Batch Scanner**: Analyzes multiple grocery items captured in a single photo, calculating individual bounding boxes and per-item nutrition scorecards.
- **Instant Interactive Demos**: 1-click test samples (Grade A Rolled Oats, Grade C Fruit Yogurt, and Grade E Sugary Chocolate Drink) for zero-setup demonstrations.

---

### 2. 🧮 Algorithmic Health Intelligence Engines
- **Official Nutri-Score Algorithm**: Calculates standardized European Nutri-Score grades (`A` through `E`) based on negative points (calories, sugars, saturated fats, sodium) balanced against positive points (fiber, protein, fruit/vegetable percentage).
- **NOVA Processing Scale**: Classifies products into NOVA Groups 1–4 (from unprocessed whole foods to industrial ultra-processed formulations).
- **Glycemic Index (GI) & Glycemic Load (GL) Estimator**: Calculates postprandial blood sugar impact per serving, categorizing glycemic risk as *Low*, *Moderate*, or *High*.
- **Gut Microbiome Health Index (0–100)**: Evaluates microbiome safety by penalizing toxic emulsifiers, artificial sweeteners, and synthetic thickeners (e.g., Polysorbate 80, Carrageenan, Sucralose, Carboxymethylcellulose).
- **Hidden Sugar Radar**: Unmasks over 60+ deceptive industrial sugar aliases (Maltodextrin, Dextrose, High Fructose Corn Syrup, Agave Nectar, Invert Sugar, etc.).
- **EU & FDA Regulatory Alert System**: Automatically flags additives that are banned, restricted, or carry warning labels in the European Union and the United States (e.g., Titanium Dioxide E171, Potassium Bromate, Red 40).
- **Seed Oil & Inflammatory Fat Radar**: Detects industrial, high-heat solvent-extracted seed oils (Canola, Soybean, Corn, Cottonseed) with elevated Omega-6 linoleic acid ratios, recommending clean unrefined alternatives (EVOO, Avocado Oil, Grass-Fed Ghee).
- **FDA 2024 Front-of-Package (FOP) Simulator**: Simulates upcoming US FDA front-of-package standardized warning labels for high Added Sugars, Saturated Fat, and Sodium.
- **Smart Healthy Swaps Engine**: Recommends clinically superior, category-matched alternatives with Grade A/B Nutri-Score and NOVA 1/2 ratings.

---

### 3. 🎯 Medical Personalization & Privacy
- **Client-Side Encrypted Health Profile**: Zero tracking. Health data stays strictly in local browser storage.
- **Medical Condition Presets**:
  - 🩸 **Diabetes**: Flags high glycemic loads and carbohydrate density.
  - 🫀 **Hypertension**: Flags high-sodium thresholds.
  - 🌾 **Celiac Disease**: Highlights gluten-containing cereals and cross-contamination warnings.
  - 🧂 **Low-Sodium Diet**: Custom daily milligram limits.
- **Dietary Filter Engine**: Vegan, Vegetarian, Gluten-Free, Lactose-Free, Pork-Free, Soy-Free, Sulfite-Free, and Palm-Oil-Free checks.
- **Dynamic Portion Scaler**: Real-time recalculation of nutritional values and glycemic loads based on custom portion sizes (grams, ounces, or package servings).

---

### 4. 📦 Grocery Management & Community Features
- **Smart Digital Pantry**: Keep inventory of pantry items, track freshness/expiration dates, and monitor your household's overall pantry health score.
- **Curated Shopping Lists**: Organize grocery shopping lists segmented by health grades with 1-click clipboard export.
- **Searchable Scan History**: Comprehensive timeline of all past scans with grade-level filtering and search.
- **Hall of Shame Feed**: Community-driven leaderboard exposing egregious greenwashing examples, ranked by calculated discrepancy scores and upvotes.
- **Clinical PDF & Image Export**: High-resolution report generation via `html2canvas` and `jsPDF` for sharing with nutritionists, dietitians, or doctors.
- **Offline PWA Architecture**: Progressive Web App with service worker caching and IndexedDB queueing, allowing scans to be cached offline and synchronized when reconnected.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript 5.4](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) with Custom Design Tokens & Glassmorphism |
| **Animations** | [Framer Motion 11](https://www.framer.com/motion/) |
| **Vision & AI** | [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) (`gemini-1.5-flash`) |
| **Barcodes & OCR** | [@zxing/browser](https://github.com/zxing-js/browser), [Open Food Facts API](https://world.openfoodfacts.org/) |
| **Offline Storage** | IndexedDB via [idb 8](https://github.com/jakearchibald/idb), LocalStorage |
| **Validation** | [Zod 3.23](https://zod.dev/) |
| **Document Export** | [jspdf](https://github.com/parallax/jsPDF), [html2canvas](https://html2canvas.hertzen.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📁 Repository Structure

```text
NutriGrade-AI/
├── public/                     # Static assets, icons, and service worker (sw.js)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Backend API routes
│   │   │   ├── analyze-label/  # Vision OCR & Open Food Facts fallback endpoint
│   │   │   ├── analyze-dual/   # Front-vs-Back greenwashing audit endpoint
│   │   │   ├── analyze-batch/  # Multi-item photo scanning endpoint
│   │   │   ├── hall-of-shame/  # Community greenwashing feed & upvotes
│   │   │   └── search-products/# Live Open Food Facts search
│   │   ├── hall-of-shame/      # Hall of Shame leaderboard page
│   │   ├── history/            # Scan history management page
│   │   ├── lists/              # Shopping lists page
│   │   ├── pantry/             # Pantry manager page
│   │   ├── globals.css         # Custom animations & theme definitions
│   │   ├── layout.tsx          # Root layout & meta configuration
│   │   └── page.tsx            # Main application dashboard & scanner
│   ├── components/             # Reusable UI & analytical components
│   │   ├── AdditiveInspector.tsx          # Toxicological additive explorer
│   │   ├── BarcodeScanner.tsx             # ZXing camera scanner
│   │   ├── DietaryPreferencesModal.tsx    # Dietary restriction modal
│   │   ├── ExportReport.tsx               # PDF and sharing engine
│   │   ├── FopNutritionBox.tsx            # FDA Front-of-Package card
│   │   ├── GlycemicAndGutCard.tsx         # Blood sugar & microbiome insights
│   │   ├── HallOfShameCard.tsx            # Greenwashing item card
│   │   ├── HealthySwaps.tsx               # Cleaner food alternative recommendations
│   │   ├── LiveCameraScanner.tsx          # Real-time WebRTC camera feed
│   │   ├── MarketingAuditCard.tsx         # Dual-scan claim verification cards
│   │   ├── MultiItemBatchViewer.tsx       # Bounding box multi-product viewer
│   │   ├── NutriScoreAccordion.tsx        # Point-by-point Nutri-Score calculation
│   │   ├── NutriScoreBadge.tsx            # Five-color official Nutri-Score badge
│   │   ├── NutritionDashboard.tsx         # Core analysis presentation container
│   │   ├── OfflineBanner.tsx              # PWA network status & sync indicator
│   │   ├── PantryView.tsx                 # Home pantry management UI
│   │   ├── PersonalHealthBanner.tsx       # Medical condition alert banner
│   │   ├── PortionScaler.tsx              # Dynamic portion adjustments
│   │   ├── RegulatoryAndHiddenSugarsCard. # EU/FDA and sugar alias flags
│   │   ├── SeedOilBanner.tsx              # Inflammatory seed oil warnings
│   │   └── UploadZone.tsx                 # Drag-and-drop / camera / demo sample zone
│   ├── lib/
│   │   ├── algorithms/                    # Deterministic mathematical models
│   │   │   ├── biologicalEngine.ts        # GI, GL, Gut Health & Regulatory rules
│   │   │   ├── dietaryAudit.ts            # Vegan, Halal, Kosher, Gluten checks
│   │   │   ├── fdaFopSimulator.ts         # FDA 2024 FOP warning label simulator
│   │   │   ├── greenwashingDetector.ts    # Front-to-back cross-check engine
│   │   │   ├── novaScale.ts               # Ultra-processing NOVA 1-4 classifier
│   │   │   ├── nutriScore.ts              # Official European Nutri-Score points
│   │   │   ├── personalizer.ts            # Medical conditions overlay
│   │   │   ├── seedOilRadar.ts            # Industrial seed oil detection
│   │   │   └── swapsEngine.ts             # Healthier product recommendation matrix
│   │   ├── data/                          # Additives database & shame feed seed
│   │   ├── services/                      # Open Food Facts API integration
│   │   ├── storage/                       # IndexedDB, localStorage & sync utilities
│   │   ├── utils/                         # Image compression & unit normalization
│   │   └── validation/                    # Zod schemas for input/output sanitization
│   └── types/                             # TypeScript definitions (nutrition, user, etc.)
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm**, **yarn**, or **pnpm**
- **Google Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/NutriGrade-AI.git
   cd NutriGrade-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: If no API key is provided, NutriGrade AI gracefully falls back to built-in demo fixtures so you can test all UI features locally without an account!)*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to start analyzing food products!

---

## 🔒 Privacy & Medical Disclaimer

NutriGrade AI operates with strict privacy principles:
- **Zero Server Tracking**: Personal medical conditions and dietary preferences are stored encrypted locally on your device.
- **Educational & Information Tool**: NutriGrade AI is designed to assist consumers in understanding food labels and regulatory standards. It does not provide medical diagnosis or replace personalized advice from qualified healthcare providers.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it in your personal and commercial projects.
