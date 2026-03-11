# ⚛ PhysicsScan — FBD Generator

Point your camera at ANY object → AI detects it → generates a complete Free Body Diagram.

---

## 🚀 HOW TO RUN (Do these steps IN ORDER)

### Step 1 — Install Node.js
Download from: https://nodejs.org (click the "LTS" version)
This gives you `npm` — the tool that installs React and all its friends.

### Step 2 — Open Terminal / Command Prompt
- **Windows**: Press Win+R, type `cmd`, press Enter
- **Mac**: Press Cmd+Space, type `terminal`, press Enter

### Step 3 — Navigate to this folder
```bash
cd path/to/fbd-scanner
# Example: cd Desktop/fbd-scanner
```

### Step 4 — Install dependencies
```bash
npm install
```
This reads package.json and downloads React, Vite, etc. into a `node_modules` folder.
(Takes 1-2 minutes, totally normal!)

### Step 5 — Add your API key
1. Open the `.env` file in any text editor
2. Go to https://aistudio.google.com
3. Click **Get API Key** → **Create API key in new project**
4. Copy the key (looks like: `AIzaSyABC123...`)
5. Replace `paste_your_key_here` with your actual key
6. Save the file

### Step 6 — Start the app!
```bash
npm run dev
```
Open your browser at: **http://localhost:5173**

---

## 📁 PROJECT STRUCTURE (what each file does)

```
fbd-scanner/
├── src/
│   ├── App.jsx              ← The main brain — manages all app state
│   ├── App.css              ← All the styling
│   ├── main.jsx             ← Entry point — mounts React into index.html
│   └── components/
│       ├── CameraView.jsx   ← Camera access + photo capture
│       ├── FBDDisplay.jsx   ← Draws the FBD on canvas + shows force details
│       └── ScanButton.jsx   ← The start button (tiny, pure component)
├── index.html               ← The single HTML shell
├── .env                     ← Your secret API key (NEVER share this!)
├── package.json             ← Project config + dependency list
└── vite.config.js           ← Build tool config
```

---

## 🧠 REACT CONCEPTS IN THIS PROJECT

| Concept | Where to find it | What it does |
|---------|-----------------|--------------|
| `useState` | App.jsx line ~20 | Stores and remembers values |
| `useEffect` | CameraView.jsx | Runs code after render |
| `useRef` | CameraView.jsx | Grabs real DOM elements |
| Props | Every component | Passes data between components |
| `.map()` | FBDDisplay.jsx | Renders lists from arrays |
| Conditional rendering | App.jsx return | Shows/hides components |
| async/await | App.jsx analyzeWithAI | Handles API calls |
| JSX | Everywhere | HTML inside JavaScript |

---

## 🗓 YOUR 7-DAY PLAN

- **Day 1 (Mar 8)** ← YOU ARE HERE — Setup + camera working ✅
- **Day 2 (Mar 9)** — AI analysis connected ✅ (already done!)
- **Day 3 (Mar 10)** — Improve FBD drawing (better arrows, angles)
- **Day 4 (Mar 11)** — Add multiple objects support
- **Day 5 (Mar 12)** — Physics calculations panel (ΣF = ma)
- **Day 6 (Mar 13)** — Polish, mobile testing, edge cases
- **Day 7 (Mar 14)** — Deploy to Vercel!

---

## 🚢 DEPLOYING TO VERCEL (Day 7)

```bash
npm install -g vercel
vercel
```
When asked, add your VITE_GEMINI_API_KEY as an environment variable.
You'll get a live URL like: `https://fbd-scanner.vercel.app`

---

## ❓ COMMON ISSUES

**"Cannot find module"** → Run `npm install` again

**"Camera not working"** → Must use HTTPS or localhost (not file://)

**"API key invalid"** → Double-check no spaces around the key in .env

**"JSON parse error"** → The AI returned unexpected text, try scanning again
