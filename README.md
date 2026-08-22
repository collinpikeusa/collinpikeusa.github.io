# WE4RR — Amateur Radio Station Site

A static site for **WE4RR** (Collin Pike, ex-KJ4AXB) — Augusta, Georgia.
No build step, no dependencies, no framework. Plain HTML, CSS, and vanilla JS.

| Page | What it is |
|---|---|
| `index.html` | The main site — about, station, POTA, awards, QSL |
| `qrz.html` | Generates paste-ready HTML for the QRZ.com bio |

## Live data

Both pages fetch `https://api.pota.app/profile/WE4RR` in the browser. That endpoint
sends `Access-Control-Allow-Origin: *`, so it works from GitHub Pages with no proxy
and no API key.

Activation counts, park counts, QSO totals, the recent-activation table, and the full
award list all come from that call, so **the site stays current on its own**. If the API
is unreachable, the numbers baked into the HTML are shown instead and a small note says so.

## Publishing to GitHub Pages

The remote is already set to `git@github.com:collinpikeusa/we4rr.github.io.git`.

```
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment**
Source: *Deploy from a branch* · Branch: `main` · Folder: `/ (root)` · Save.

`.nojekyll` is included so GitHub serves the files as-is.

### A note on the repository name

GitHub only treats a repo as a *user site* — served from the bare root — when it is
named exactly `<username>.github.io`. This repo is `we4rr.github.io` owned by
`collinpikeusa`, which does not match, so it is published as a **project site**:

```
https://collinpikeusa.github.io/we4rr.github.io/
```

To get a clean root URL instead, rename the repo to **`collinpikeusa.github.io`**
(Settings → General → Repository name). It would then serve from:

```
https://collinpikeusa.github.io/
```

Either way, update the canonical URL near the top of `index.html` to match:

```html
<link rel="canonical" href="https://collinpikeusa.github.io/we4rr.github.io/">
```

Everything else uses relative paths and needs no change.

### Custom domain

If you ever buy a domain, add a file called `CNAME` containing just the hostname
(e.g. `we4rr.radio`), point a DNS `CNAME` record at `collinpikeusa.github.io`, and
set it under Settings → Pages.

## Refreshing the QRZ bio

QRZ cannot run JavaScript in a bio, so those numbers are frozen when you paste.
Open `qrz.html`, click **Copy HTML**, and paste into QRZ's bio editor in
**source mode**. Repeat whenever you want the figures brought up to date.

The template is a single `build()` function in `assets/js/qrz.js` — the prose is
plain text in there, so edit it directly.

## Editing content

Everything is hand-editable HTML with comments marking each section.

- **Prose, gear list, QSL info** → `index.html`
- **Colours, spacing, typography** → the `:root` block at the top of `assets/css/style.css`
  (a `[data-theme="light"]` block right below it holds the light palette)
- **Live data handling** → `assets/js/main.js`
- **QRZ bio template** → `assets/js/qrz.js`

## Photos

Three separate things, three separate places.

### 1. Your own QSL card

Save the image as **`assets/img/qsl-card-we4rr.jpg`** (`.png` and `.webp` also work).
It appears at the top of the QSL section, and clicking it opens it full size.
If the file is not there, the block hides itself and nothing looks broken.

### 2. Activation photos → rotating carousel

Drop images into **`assets/photos/activations/`**. They become an auto-rotating
slideshow with arrows, dots, a pause button, keyboard arrows, and swipe on touch.

### 3. QSL cards you have received → gallery

Drop images into **`assets/photos/qsl/`**. They become a grid; clicking one opens
a lightbox you can arrow through.

### How the folders become a gallery

There is no server to list a directory, so the file list lives in
`assets/photos/photos.json`. You do **not** maintain it by hand — a GitHub Action
(`.github/workflows/photos.yml`) rebuilds it on every push that touches a photo
folder. Add photos through the GitHub web UI if you like; it still works.

Working locally and want to see them before pushing:

```
python3 tools/build-photo-manifest.py
```

Naming files like `2026-08-02_US-2913_Sesquicentennial-State-Park.jpg` gets you a
date, a clickable park link, and a title for free. See `assets/photos/README.md`
for the details and for how to add your own captions — captions you write are
never overwritten by a rebuild.

Both photo sections **remove themselves entirely** when they have no images, so the
site never shows an empty shell. While previewing on `localhost` you get a dashed
"drop photos here" placeholder instead; visitors never see it.

## Local preview

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## License

Content © Collin Pike, WE4RR. Code is free to reuse.
