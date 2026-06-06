# 🏙️ AdCity — A 3D Explorable World Made of Ads

A satirical, immersive 3D city where every building, billboard, and surface is plastered with advertisements. Built with **Three.js** and surrounded by **real Google AdSense** ad slots that earn you real money.

![Status](https://img.shields.io/badge/status-ready%20to%20deploy-brightgreen)
![Stack](https://img.shields.io/badge/stack-Three.js%20%2B%20AdSense-blue)
![License](https://img.shields.io/badge/license-MIT-purple)

## ✨ Features

- 🌆 **Procedurally generated 3D city** — buildings, billboards, neon lights
- 🎨 **Every surface is an ad** — canvas-rendered ad textures on every wall
- 🚶 **First-person exploration** — WASD + mouse look (PointerLock)
- 💰 **8 AdSense ad slots** — top banner, bottom banner, 4 side rails, floating overlay
- 📱 **Responsive** — desktop, tablet, mobile (rails collapse on small screens)
- 🚀 **Zero build step** — pure HTML/JS via importmap & CDN
- 🔒 **AdSense-compliant** — privacy policy, terms, ads.txt included

## 📁 Project Structure

```
AdCity/
├── index.html              ← main page
├── styles.css              ← all CSS
├── app.js                  ← Three.js world (ES module)
├── ads.txt                 ← AdSense verification
├── robots.txt              ← SEO
├── sitemap.xml             ← SEO
├── privacy.html            ← required by AdSense
├── terms.html              ← terms of use
├── netlify.toml            ← Netlify deploy config
├── vercel.json             ← Vercel deploy config
└── .github/workflows/
    └── deploy.yml          ← GitHub Pages auto-deploy
```

## 🚀 Quick Start (Local)

```bash
# Just serve the folder with any static server:
npx serve .
# or
python3 -m http.server 8000
```
Open <http://localhost:8000>.

> ⚠️ Don't open `index.html` via `file://` — ES modules need `http(s)://`.

## 🌍 Deploying Publicly

Pick **any one** of these (all free):

### Option A — Netlify (drag & drop, fastest)
1. Go to <https://app.netlify.com/drop>
2. Drag the entire project folder.
3. Done. You get a `*.netlify.app` URL instantly.
4. Optionally add a custom domain in Site Settings.

### Option B — Vercel
1. Push the repo to GitHub.
2. Go to <https://vercel.com/new>, import the repo.
3. Click **Deploy** (no settings needed — `vercel.json` handles it).

### Option C — GitHub Pages (free, custom domain support)
1. Create a new GitHub repo, push this code.
2. In repo Settings → Pages → Source: **GitHub Actions**.
3. The included `.github/workflows/deploy.yml` deploys automatically on push.
4. Site is live at `https://<user>.github.io/<repo>/`.

### Option D — Cloudflare Pages
1. Connect your GitHub repo at <https://dash.cloudflare.com/?to=/:account/pages>
2. Framework preset: **None**. Build command: *(empty)*. Output: `.`
3. Deploy.

## 💰 Setting Up Google AdSense (the money part)

### Step 1 — Apply for AdSense
1. Site needs to be **publicly live** (deploy first using one of the options above).
2. Add real, original content beyond just this app to improve approval odds. Consider adding a blog page or "About AdCity" lore page.
3. Go to <https://adsense.google.com/start/> and apply with your live URL.
4. Approval takes anywhere from a few hours to a few weeks.

### Step 2 — Replace placeholder IDs
After approval, you'll get a publisher ID like `ca-pub-1234567890123456`.

**Find & replace** `ca-pub-XXXXXXXXXXXXXXXX` everywhere in the project with your real ID:

```bash
# macOS/Linux:
grep -rl "ca-pub-XXXXXXXXXXXXXXXX" . | xargs sed -i '' 's/ca-pub-XXXXXXXXXXXXXXXX/ca-pub-1234567890123456/g'
```
Files affected: `index.html`, `ads.txt`.

### Step 3 — Create ad units
In your AdSense dashboard:
1. **Ads → By ad unit → Create new ad unit** (Display ad, Responsive).
2. Copy the `data-ad-slot="..."` number for each unit.
3. In `index.html`, replace the placeholder slot IDs:

| Placeholder    | Location              | Recommended unit            |
| -------------- | --------------------- | --------------------------- |
| `1111111111`   | Top banner            | Horizontal banner           |
| `2222222222`   | Left rail (top)       | Vertical / square           |
| `3333333333`   | Left rail (bottom)    | Vertical / square           |
| `4444444444`   | Right rail (top)      | Vertical / square           |
| `5555555555`   | Right rail (bottom)   | Vertical / square           |
| `6666666666`   | Floating overlay      | Banner / square             |
| `7777777777`   | Bottom banner         | Horizontal banner           |

### Step 4 — Verify ads.txt
Visit `https://yoursite.com/ads.txt` — it must show the line with **your** publisher ID. AdSense checks this.

## 🎨 Customising the World

Open `app.js`:

- **City size:** change `GRID = 7` (7×7 blocks). Try `9` for a bigger city (slower).
- **Block / street size:** `BLOCK = 28`, `STREET = 8`.
- **Ads shown in 3D:** edit the `ADS` array — add your own slogans/colors.
- **Movement speed:** in `animate()`, the line `const speed = keys.shift ? 18 : 8`.
- **Sky / fog color:** `scene.background` and `scene.fog`.

## 📈 Driving Traffic (so you actually earn)

AdSense pays per impression/click. To gain traction:

1. **Share on novelty-loving communities:** r/InternetIsBeautiful, r/webgl, r/threejs, r/web_design, Hacker News (Show HN), Product Hunt.
2. **TikTok / Twitter / YouTube Shorts** — record a 15-second flythrough; the visual is naturally shareable.
3. **SEO basics:** the `<meta>` tags, `sitemap.xml`, and `robots.txt` are already set up. Submit to Google Search Console.
4. **Add lore / content pages** about "the dystopian city of pure commerce" — gives AdSense more pages to monetise and helps approval.

## ⚖️ AdSense Policy Notes

- ❌ Don't click your own ads.
- ❌ Don't ask others to click ("please click the ads").
- ✅ The "Advertisement" label on every ad slot is **required by Google policy** — already included.
- ✅ Privacy policy linked in footer — **required**.
- ✅ Make sure your site has *some* content beyond just the 3D world; pure-game sites can be flagged.

## 🛠️ Tech

- [Three.js](https://threejs.org/) r160 (loaded via importmap from unpkg)
- Vanilla HTML / CSS / JS — no bundler, no npm install
- Procedural canvas textures for ads (no external images required)
- PointerLockControls for FPS-style movement
- AABB collision against building bounding boxes

## 📜 License

MIT — do whatever you want, including selling ads on your version of AdCity.

---

**Built as a satire of the modern ad-saturated web. Now go saturate the web with it.** 🏙️💸