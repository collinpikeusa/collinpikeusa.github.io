# Photos

Drop image files into these two folders. Nothing else is required — a GitHub
Action rebuilds `photos.json` on every push, and the site reads that.

```
activations/   photos from park activations  → rotating carousel on the site
qsl/           scans/photos of QSL cards     → gallery with a lightbox
```

## Naming

Names are optional, but if you follow these patterns the captions write themselves.

**Activations** — `YYYY-MM-DD_REF_Park-Name.jpg`

```
2026-08-02_US-2913_Sesquicentennial-State-Park.jpg
2026-07-18_US-9799_Stone-Mountain.jpg
2026-06-28_US-2207_Watson-Mill-Bridge.jpg
```

Any part can be left out. `mistletoe-again.jpg` works fine — it just gets a
plainer caption.

**QSL cards** — `CALLSIGN.jpg`

```
DL1ABC.jpg
VK3XYZ_2024.jpg
JA1QRP-front.jpg
```

## Editing captions

Open `photos.json` and add a `caption` to any entry. Your text is **never**
overwritten — the rebuild only adds new files and removes deleted ones.

```json
{
  "file": "2026-08-02_US-2913_Sesquicentennial-State-Park.jpg",
  "date": "2026-08-02",
  "ref": "US-2913",
  "title": "Sesquicentennial State Park",
  "caption": "Loop set up under the pines. 25 QSOs before the rain came in."
}
```

## Rebuilding by hand

If you are working locally and want to see photos before pushing:

```
python3 tools/build-photo-manifest.py
```

## A note on file size

These load in the browser, so keep them reasonable — 1600px on the long edge
and under ~500 KB each is plenty. Large files make the page slow, and GitHub
Pages has a 1 GB repository limit.
