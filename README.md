# Kristianto · Film Craft + Code Portfolio

Live site: [https://bykristianto.my.id](https://bykristianto.my.id)

Interactive portfolio for **Kristianto, S.Sn** · Television & Film graduate (`Cum Laude`), Video Editor, Motion Explainer Producer, and Creative Web Builder. Built with tactile *ligne-claire* / Retro OS styling, live interactive physics & audio labs, bilingual **EN / ID** support, and a 14-work video screening room.

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** (`@vitejs/plugin-react` + `@tailwindcss/vite`)
- **Tailwind CSS v4**
- **GSAP** + `@gsap/react`
- **HTML5 Canvas 2D & Web Audio API** (interactive physics cables, Visual Diff Studio, synthesized + curated foley/BGM SFX)
- **Stockfish 19 WASM** + `chess.js` (lazy-loaded 15+0 rapid chess mini-game across 1000–1900 Elo personas)
- **Web3Forms API** + WhatsApp pre-filled inquiry dispatcher

---

## Key Features

- **Hero Verlet Patch Cords:** Interactive studio cables you can bend and pluck with optional Web Audio tones.
- **14 Selected Video Works (`9:16` & `16:9`):** Filterable archival catalogue with custom Screening Room modal, case study breakdown, burned-in captions, and `.vtt` subtitle tracks on supported reels.
- **Craft Lab:**
  - *Visual Before / After Studio* (interactive split comparator for color grading, 16:9 documentary motion, and 9:16 retention edits)
  - *Chess vs Kristianto* (1000 / 1500 / 1900 Elo AI engine with custom pixel portraits, opening book, and contextual dialogue)
  - *Meme SFX Game* (8-pad soundboard + Simon-style memory challenge)
- **Services, Credits & Web Builds:** Separated Video & Website service tracks with optional `+ Add-On Video Promo` toggle routing directly into the Contact brief.
- **Bilingual (`EN` / `ID`):** Full switching across navigation, case studies, interactive labs, and inquiry forms.

---

## Local Development & Environment Variables

```bash
npm install
npm run dev
```

During `npm run dev` (and local `npm run preview`), Vite streams the `.mp4` showcase files directly from `assets/videos/` via HTTP `206` range requests (`vite.config.ts`) without duplicating ~900 MB of video into `dist/`.

Copy `.env.example` to `.env` and configure for production deployment:

```env
# Base URL of external CDN / Object Storage hosting the MP4s (e.g. Cloudflare R2, Bunny Stream, Vercel Blob)
VITE_VIDEO_BASE_URL=

# Web3Forms public access key for email inquiry delivery
VITE_WEB3FORMS_ACCESS_KEY=
```

Build & lint verification:

```bash
npm run lint
npm run build
```

---

## Contact

- **Email:** kristianto.too@gmail.com
- **LinkedIn:** [Kristianto](https://www.linkedin.com/in/kristianto-too)
- **Instagram:** [@kristianto.too](https://www.instagram.com/kristianto.too/)
- **GitHub:** [SakamotoSan7](https://github.com/SakamotoSan7)
