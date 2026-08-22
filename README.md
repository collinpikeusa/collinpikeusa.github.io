# WE4RR — Amateur Radio Station Site

A static site for **WE4RR** (Collin Pike, ex-KJ4AXB) — Augusta, Georgia.
No build step, no dependencies, no framework. Plain HTML, CSS, and vanilla JS.

The site is a single page: `index.html`.

## Live data

The page fetches `https://api.pota.app/profile/WE4RR` in the browser. That endpoint
sends `Access-Control-Allow-Origin: *`, so it works from GitHub Pages with no proxy
and no API key.

Activation counts, park counts, QSO totals, the recent-activation table, and the full
award list all come from that call, so **the site stays current on its own**. If the API
is unreachable, the numbers baked into the HTML are shown instead and a small note says so.

## Publishing to GitHub Pages

The site is served from **`https://collinpikeusa.github.io/`**.

That root URL only works while the repository is named exactly
`collinpikeusa.github.io` — GitHub reserves bare-root hosting for a repo whose name
matches the account name. Any other name (including `we4rr.github.io`) is treated as
a *project site* and lands at `https://collinpikeusa.github.io/<repo-name>/` instead.

To publish:

```
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment**
Source: *Deploy from a branch* · Branch: `main` · Folder: `/ (root)` · Save.

`.nojekyll` is included so GitHub serves the files as-is.

If you ever rename the repository, update the canonical URL near the top of
`index.html` to match. Everything else uses relative paths and needs no change.

### Custom domain

If you buy a domain, add a file called `CNAME` containing just the hostname
(e.g. `we4rr.radio`), point a DNS `CNAME` record at `collinpikeusa.github.io`, and
set it under Settings → Pages.


## Editing content

Everything is hand-editable HTML with comments marking each section.

- **Prose, gear list, QSL info** → `index.html`
- **Colours, spacing, typography** → the `:root` block at the top of `assets/css/style.css`
  (a `[data-theme="light"]` block right below it holds the light palette)
- **Live data handling** → `assets/js/main.js`

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
