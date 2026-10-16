# 📘 GeniusConnects AI Poster Generator — தமிழ் விளக்க ஆவணம் (Tamil Guide)

இந்த ஆவணம் **GeniusConnects AI Poster Generator** திட்டத்தின் அனைத்து கோப்புகள் (**app**, **components**, **utils**) மற்றும் அவற்றின் முக்கிய பயன்பாடுகளைத் தமிழில் எளிமையாக விளக்குகிறது.

---

## 📂 கோப்பு கட்டமைப்பு & நோக்கங்கள் (File Structure & Purpose)

```
src/
├── 📁 app/                   # App Router (பக்கங்கள் & தளவமைப்பு)
│   ├── globals.css           # Global Styles & Tailwind CSS
│   ├── layout.tsx            # HTML Structure & Font loader
│   └── page.tsx              # Main Page Controller & State Manager
│
├── 📁 components/            # UI பாகங்கள் (Reusable React Components)
│   ├── Controls.tsx          # வலது பக்கக் கட்டுப்பாட்டுப் பலகம் (Sidebar)
│   └── PosterCanvas.tsx      # இடது பக்க 2D Canvas & Eraser Engine
│
└── 📁 utils/                 # துணைக் கருவிகள் (Utilities)
    └── bgRemover.ts          # AI Background Removal & Edge Cleaner
```

---

## 1. 📁 `src/app/` — பயன்பாட்டின் முதன்மைப் பகுதி (App Router Core)

### 📄 [`page.tsx`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/app/page.tsx) — பிரதான கட்டுப்பாட்டாளர் (Main Page Controller)
* **நோக்கம்**: முழு பயன்பாட்டையும் ஒருங்கிணைக்கும் முதன்மைப் பக்கம் (**Master State Controller**).
* **செயல்பாடுகள்**:
  1. அனைத்து அமைப்புகளின் தரவுகளையும் (`settings`, `personImageUrl`, `isRemovingBg`, `activeTab`) ஒரே இடத்தில் சேமித்து நிர்வகிக்கிறது.
  2. பயனரின் Photo Upload-ஐப் பெற்று `bgRemover.ts` மூலம் AI-க்கு அனுப்புகிறது.
  3. இடது பக்கத்தில் `PosterCanvas`-ஐயும், வலது பக்கத்தில் `Controls`-ஐயும் இணைத்து அழகிய Layout தருகிறது.
  4. உருவாக்கப்பட்ட போஸ்டரை **High-Res PNG ஆக பதிவிறக்கம் (Download)** செய்யவும், Confetti (கொண்டாட்ட பட்டாசு) அனிமேஷன் காட்டவும் உதவுகிறது.

---

### 📄 [`layout.tsx`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/app/layout.tsx) — தளவமைப்பு வடிவம் (Root Layout)
* **நோக்கம்**: அனைத்துப் பக்கங்களுக்குமான பொதுவான HTML வடிவமைப்பு.
* **செயல்பாடுகள்**:
  1. Web Page தலைப்பு (`GeniusConnects Poster Generator`) மற்றும் Meta தகவல்களை அமைக்கிறது.
  2. Google Fonts (`Lexend Deca`, `Inter`, `Outfit`, `Montserrat` போன்றவை) இணையத்திலிருந்து லோட் செய்கிறது.

---

### 🎨 [`globals.css`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/app/globals.css) — உலகளாவிய பாணிகள் (Global CSS)
* **நோக்கம்**: பயன்பாட்டின் வண்ணங்கள் மற்றும் வடிவமைப்பு விதிகள்.
* **செயல்பாடுகள்**:
  1. Tailwind CSS v4 பாணிகளை இறக்குமதி செய்கிறது.
  2. Scrollbar தோற்றம், அனிமேஷன்கள் மற்றும் Canvas எல்லைப் பாணிகளை வரையறுக்கிறது.

---

## 2. 📁 `src/components/` — பயனர் இடைமுகக் கூறுகள் (UI Components)

### 🎛️ [`Controls.tsx`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/components/Controls.tsx) — கட்டுப்பாட்டுப் பலகம் (Sidebar Control Panel)
* **நோக்கம்**: பயனர் போஸ்டரைத் தன் விருப்பப்படி மாற்ற உதவும் வலது பக்கச் செயல்பாட்டுப் பலகம்.
* **செயல்பாடுகள் (4 Tabs)**:
  1. **Upload Tab**: புகைப்படத்தைப் பதிவேற்றவும், AI Background Remover இயக்கும் பட்டன்.
  2. **Text Tab**: அறிவிப்புத் தலைப்பு (Heading), Font வகை, Font அளவு மற்றும் Banner உயரத்தைக் கட்டுப்படுத்த.
  3. **Person Tab**: நபரின் புகைப்படத்தை Zoom in/out செய்ய, நகர்த்த (Offset X/Y), பிரகாசம் (Brightness/Contrast) மாற்ற மற்றும் **Eraser Mode** இயக்க.
  4. **Style Tab**: தயார் செய்யப்பட்ட Gradient வண்ணங்கள் அல்லது புதிய தனிப்பயன் பின்னணி வண்ணங்களைத் தேர்வு செய்ய.

---

### 🖼️ [`PosterCanvas.tsx`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/components/PosterCanvas.tsx) — கேன்வாஸ் எஞ்சின் (HTML5 Canvas Engine)
* **நோக்கம்**: நிகழ்நேரத்தில் (Real-time) போஸ்டரை வரைந்து காட்டும் 2D Canvas Engine.
* **செயல்பாடுகள்**:
  1. 1200×1500px உயர்தரத் தெளிவுத்திறனில் (Resolution) போஸ்டரை வரைகிறது.
  2. பின்னணி Gradient ➔ ஆளின் Cutout Photo ➔ வெள்ளைப் பட்டி (Banner) ➔ வாழ்த்துச் செய்தி (Text Overlay) என ஒன்றன் மேல் ஒன்றாக அடுக்காக (Layers) வரைகிறது.
  3. **Manual Eraser Brush**: பயனர்கள் தன் கையாலேயே தேவையற்ற பிசிறுகளை அழிக்கும் Eraser வசதியைத் தருகிறது.

---

## 3. 📁 `src/utils/` — துணைக் கருவிகள் (Utility Services)

### 🤖 [`bgRemover.ts`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/utils/bgRemover.ts) — AI பின்னணி நீக்கி (AI Background Remover & Edge Cleaner)
* **நோக்கம்**: புகைப்படத்தின் பின்னணியை (Background) தானாக நீக்கி, நபரின் வடிவத்தை மட்டும் பிரித்தெடுக்கும் AI எஞ்சின்.
* **செயல்பாடுகள்**:
  1. `@imgly/background-removal` தொழில்நுட்பம் மூலம் உங்கள் **Browser-லேயே 100% இலவசமாக** இயங்குகிறது.
  2. **CleanCutoutImage**: வெட்டப்பட்ட படத்தின் ஓரங்களில் இருக்கும் தேவையற்ற நிறப் பிசிறுகளை (Defringe) மற்றும் தலைக்கு மேல் இருக்கும் Studio Light போன்றவற்றைச் சுத்தம் செய்கிறது.

---

## ⚙️ பிற முக்கிய அமைப்புக் கோப்புகள் (Config Files)

* **[`package.json`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/package.json)**: திட்டத்தின் தேவைகள் (Dependencies) மற்றும் இயக்கும் கட்டளைகளின் பட்டியல் (`npm run dev`).
* **[`tsconfig.json`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/tsconfig.json)**: TypeScript விதிகள் மற்றும் வழித்தடங்களின் அமைப்புகள் (`@/*`).
* **[`next.config.ts`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/next.config.ts)**: Next.js இன் உலகளாவிய அமைப்புகள்.

---

*ஆக்கம்: GeniusConnects AI Generator Workspace.*
