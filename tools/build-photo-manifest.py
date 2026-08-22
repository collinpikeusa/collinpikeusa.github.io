#!/usr/bin/env python3
"""
Rebuild assets/photos/photos.json from whatever image files are sitting in
assets/photos/activations/ and assets/photos/qsl/.

Run it after adding or removing photos:

    python3 tools/build-photo-manifest.py

Captions you have written by hand are preserved. Entries for files that no
longer exist are dropped. New files are added with a caption worked out from
the filename.

Filename conventions (every part is optional -- the script uses what it finds):

    activations/  YYYY-MM-DD_US-1234_Park-Name.jpg
                  2026-08-02_US-2913_Sesquicentennial-State-Park.jpg

    qsl/          CALLSIGN.jpg        or  CALLSIGN_anything.jpg
                  DL1ABC.jpg              VK3XYZ_2024.jpg
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTO_DIR = os.path.join(ROOT, "assets", "photos")
MANIFEST = os.path.join(PHOTO_DIR, "photos.json")

EXTS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}

DATE_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})")
# Underscore counts as a word character, so \b fails on "US-2913_Park".
REF_RE = re.compile(r"(?<![A-Za-z0-9])([A-Z]{1,2}-\d{3,5})(?!\d)", re.IGNORECASE)
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def pretty_date(iso):
    try:
        y, m, d = iso.split("-")
        return "%s %d, %s" % (MONTHS[int(m) - 1], int(d), y)
    except (ValueError, IndexError):
        return iso


def list_images(folder):
    path = os.path.join(PHOTO_DIR, folder)
    if not os.path.isdir(path):
        return []
    names = [f for f in os.listdir(path)
             if os.path.splitext(f)[1].lower() in EXTS and not f.startswith(".")]
    return sorted(names)


def parse_activation(filename):
    """Pull a date, park reference, and title out of the filename."""
    stem = os.path.splitext(filename)[0]
    entry = {"file": filename}

    m = DATE_RE.match(stem)
    if m:
        entry["date"] = m.group(1)
        stem = stem[len(m.group(1)):].lstrip("_- ")

    m = REF_RE.search(stem)
    if m:
        entry["ref"] = m.group(1).upper()
        stem = (stem[:m.start()] + stem[m.end():]).strip("_- ")

    title = re.sub(r"[_-]+", " ", stem).strip()
    if title and not any(c.isupper() for c in title):
        title = title.title()            # "mistletoe loop setup" -> "Mistletoe Loop Setup"
    entry["title"] = title if title else "Activation"
    return entry


# A real amateur callsign: optional prefix chars, a digit, then 1-4 letters.
# Guards against turning "card-001.jpg" into a callsign labelled "CARD".
CALL_RE = re.compile(r"^[A-Z0-9]{1,3}[0-9][A-Z]{1,4}$")


def parse_qsl(filename):
    stem = os.path.splitext(filename)[0]
    token = re.split(r"[_\-\s]", stem)[0].upper()
    entry = {"file": filename, "caption": ""}
    if CALL_RE.match(token) and any(c.isalpha() for c in token):
        entry["callsign"] = token
    return entry


def merge(existing, found, parser, key="file"):
    """Keep hand-written fields for files that still exist; add new ones."""
    by_name = {e.get(key): e for e in existing if isinstance(e, dict) and e.get(key)}
    out = []
    for name in found:
        if name in by_name:
            out.append(by_name[name])            # untouched -- captions survive
        else:
            out.append(parser(name))
    return out


def main():
    data = {"activations": [], "qsl": []}
    if os.path.exists(MANIFEST):
        try:
            with open(MANIFEST, "r", encoding="utf-8") as fh:
                loaded = json.load(fh)
            if isinstance(loaded, dict):
                data.update({k: v for k, v in loaded.items() if isinstance(v, list)})
        except (ValueError, OSError) as exc:
            print("warning: could not read existing manifest (%s) -- rebuilding" % exc,
                  file=sys.stderr)

    acts = merge(data.get("activations", []), list_images("activations"), parse_activation)
    qsls = merge(data.get("qsl", []), list_images("qsl"), parse_qsl)

    # Newest activation first when a date is known; undated ones fall to the end.
    acts.sort(key=lambda e: e.get("date") or "0000-00-00", reverse=True)
    qsls.sort(key=lambda e: (e.get("callsign") is None, e.get("callsign") or e.get("file", "")))

    for a in acts:
        if a.get("date"):
            a["dateLabel"] = pretty_date(a["date"])

    out = {"activations": acts, "qsl": qsls}

    os.makedirs(PHOTO_DIR, exist_ok=True)
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    print("photos.json: %d activation photo(s), %d QSL card(s)" % (len(acts), len(qsls)))
    for a in acts:
        print("  activation  %s" % a["file"])
    for q in qsls:
        print("  qsl         %s" % q["file"])


if __name__ == "__main__":
    main()
