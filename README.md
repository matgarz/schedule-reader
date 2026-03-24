# Schedule Reader

An AI-powered React app that reads class schedule screenshots using Gemini's vision API.

## Features

- Upload a schedule screenshot or take a photo directly (mobile)
- Claude extracts all courses, session types (LEC/TUT/LAB), days, and times
- Mobile-first layout with sticky CTA, safe-area support, and camera access
- Fully typed with TypeScript

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Get a free Gemini API key

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API key** — it's free, no credit card needed

### 3. Set up your API key

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_GEMINI_API_KEY=your_key_here
```

### 4. Run the dev server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

**Free tier limits:** 15 requests/min · 1,500 requests/day — more than enough for personal use.

## Project Structure

```
src/
├── components/
│   ├── CourseCard.tsx      # Individual session card
│   ├── ResultsPanel.tsx    # Grid of all detected sessions + summary
│   ├── SessionBadge.tsx    # LEC / TUT / LAB badge
│   ├── Spinner.tsx         # Loading spinner
│   └── UploadZone.tsx      # Drag-drop + camera upload area
├── lib/
│   └── api.ts              # Anthropic API call + prompt
├── pages/
│   └── ScheduleReader.tsx  # Main page
├── App.tsx
├── index.css               # Global styles + responsive utilities
├── main.tsx
├── types.ts                # Shared TypeScript interfaces
└── vite-env.d.ts
```

## Tech Stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [Anthropic Claude API](https://docs.anthropic.com/) (vision)
- No UI library — pure CSS with CSS custom properties
