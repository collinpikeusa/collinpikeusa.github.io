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

1. Create a repository on GitHub. Naming it **`we4rr.github.io`** gives you
   `https://we4rr.github.io/`; any other name gives you
   `https://<user>.github.io/<repo>/`.

2. Push this directory:

   ```
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment**
   Source: *Deploy from a branch* · Branch: `main` · Folder: `/ (root)` · Save.

4. Give it a minute, then load the URL Pages shows you.

`.nojekyll` is included so GitHub serves the files as-is.

### If you use a project repo (not `<user>.github.io`)

Update the canonical URL in `index.html`:

```html
<link rel="canonical" href="https://<user>.github.io/<repo>/">
```

Everything else uses relative paths and needs no change.

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

### Things you may want to fill in

A couple of fields could not be verified from public sources and use placeholders:

- **License class** — not shown anywhere in `index.html` yet; add a row to the
  "Station data" list if you want it.
- **Grid square** — your POTA profile has no grid set. Add one to the same list.
- **QSL card image** — drop a photo in `assets/img/` and reference it wherever you like.

## Local preview

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## License

Content © Collin Pike, WE4RR. Code is free to reuse.
