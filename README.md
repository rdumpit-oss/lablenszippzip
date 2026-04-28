# LabLens 🔬

AI-powered lab result explainer. Upload a photo of your lab results and get a plain-language breakdown of every value — what it measures, what your number means, and questions to ask your doctor.

Built with React + Vite, deployed on Vercel, powered by Claude's vision API.

---

## Local development

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/lablens.git
cd lablens
npm install
```

### 2. Add your API key

```bash
cp .env.example .env
```

Open `.env` and paste your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run locally

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

The Vite dev server proxies `/api/*` to Anthropic with your key injected server-side, so it's never exposed in the browser.

---

## Deploy to Vercel (free)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/lablens.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import your GitHub repo
4. Framework preset will auto-detect as **Vite** ✓
5. Click **Deploy**

### 3. Add your API key

In your Vercel project:
1. Go to **Settings → Environment Variables**
2. Add: `ANTHROPIC_API_KEY` = `sk-ant-your-key-here`
3. Redeploy (Settings → Deployments → Redeploy)

That's it — your site is live at `https://lablens.vercel.app` (or your custom domain).

---

## Project structure

```
lablens/
├── api/
│   └── analyze.js        # Vercel serverless function (keeps API key secret)
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx           # Main LabLens component
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles + font import
├── index.html
├── vite.config.js        # Dev proxy config
├── vercel.json           # Vercel routing config
├── package.json
├── .env.example
└── .gitignore
```

## How it works

1. User uploads a lab result image (JPG, PNG, WEBP)
2. Frontend converts it to base64 and POSTs to `/api/analyze`
3. The Vercel serverless function adds the secret API key and forwards to Anthropic
4. Claude's vision model reads every test value and returns structured JSON
5. The UI renders each result with plain-language explanations and color-coded flags

## Security

- The `ANTHROPIC_API_KEY` **never touches the browser** — it lives only in the serverless function
- Images are sent directly in the request body and not stored anywhere
- No database, no user accounts, no data persistence

## Optional improvements

| Feature | How |
|---|---|
| Rate limiting | Add [Upstash Redis](https://upstash.com) to `api/analyze.js` |
| User auth | Integrate [Clerk](https://clerk.com) (~30 min) |
| Usage tracking | Log to [PlanetScale](https://planetscale.com) or Vercel KV |
| Custom domain | Vercel Settings → Domains |

---

## Disclaimer

LabLens is not a medical device. It does not diagnose, treat, or replace a licensed medical professional. Always discuss your results with your doctor.
