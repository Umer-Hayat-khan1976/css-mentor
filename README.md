# CSS Mentor

**An AI mentoring companion for CSS & PMS aspirants in Pakistan.**

## 1. What it is & the problem it solves

CSS Mentor is a web app built to support candidates preparing for Pakistan's
CSS (Central Superior Services) and PMS (Provincial Management Service) exams.
Preparation for these exams is long, isolating, and stressful — aspirants
often study alone, without a mentor to ask quick questions, review an essay
outline, or simply stay motivated through a demanding syllabus.

CSS Mentor addresses this by pairing every aspirant with **Study Buddy**, an
in-app AI mentor available anytime by chat or voice, focused exclusively on
CSS/PMS preparation — subject guidance, essay and precis help, current
affairs, study planning, and encouragement.

**Built for:** CSS and PMS aspirants at any stage of preparation, from first
attempt to repeat attempters.

## 2. Live URL

🔗 https://css-mentor.ai.studio

🔗 Shared App URL: https://ais-pre-5drz5vwnsmi522ognxe5kz-21604495087.asia-southeast1.run.app

## 3. Features

- [ ] AI mentor ("Study Buddy") for CSS/PMS preparation, available via chat
- [ ] Voice communication — speak to Study Buddy and hear spoken responses
- [ ] Persistent, per-user conversation history (Firebase-backed)
- [ ] Multiple conversation threads (e.g., Essay Help, Current Affairs, Study Plan)
- [ ] Off-topic guardrail — politely redirects any non-CSS/PMS question
- [ ] Study dashboard with recent topics and quick-start prompts
- [ ] User profile with target exam and optional subjects
- [ ] Fully responsive design (mobile + desktop)

*(Edit this list to match exactly what you shipped — remove anything you didn't build, add anything extra.)*

## 4. The AI feature

**Agent:** Study Buddy
**Model:** [Gemini model name/version used]

Study Buddy is grounded with the following system instructions, which keep it
scoped to CSS/PMS topics and enforce a polite, encouraging tone:

```
You are Study Buddy, the AI mentor inside the CSS Mentor app...
[paste your final system prompt here]
```

Key behavior:
- Stays strictly within CSS/PMS exam preparation topics
- Responds to off-topic questions with: *"I can only guide you regarding CSS
  and PMS related questions."*
- Never uses harsh or discouraging language
- Supports both text chat and voice conversation

## 5. Tools, services & models used

- **Frontend:** React, Tailwind CSS
- **AI:** Google AI Studio / Gemini API
- **Voice:** [Web Speech API / other service used]
- **Database & Auth:** Firebase (Firestore + Firebase Authentication)
- **Hosting:** [Vercel / other]
- **Built with:** Google AI Studio app builder

## 6. How to run the project

```bash
# 1. Clone the repo
git clone https://github.com/Umer-Hayat-khan1976/css-mentor
cd css-mentor

# 2. Install dependencies
npm install

# 3. Add your environment variables (Firebase config + Gemini API key)
cp .env.example .env
# then fill in .env with your own keys — never commit real secrets

# 4. Run locally
npm run dev
```

**Required environment variables:**

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `GEMINI_API_KEY` | Google AI Studio / Gemini API key |

*(Adjust variable names to match whatever your build actually generated.)*

## 7. Notes

- No API keys or secrets are committed to this repository; all are supplied
  via environment variables on the hosting platform.
- This project was built individually as the final course project for the
  ACT AI program.

## 8. GitHub repo code link

https://github.com/Umer-Hayat-khan1976/css-mentor

## 9. Important note
please connect your own Gemini API Key in order to communicate with the app live agent.
