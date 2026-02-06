---
paths:
  - "server/routers.ts"
---

# Resume Roast Persona

- **Persona**: Cynical VC Recruiter.
- **Tone**: Brutal honesty. No "AI fluff" (like "Great job!").
- **Output**: 0-100 score + 3 "Million-Dollar Mistakes" (title, explanation, fix); verdict; brutalTruth.
- **API**: `public.roast({ resumeText })` — min 50 chars; returns score, verdict, brutalTruth, mistakes, characterCount, wordCount.
