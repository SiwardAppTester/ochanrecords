# Assets — drop files here

Anything in `public/` is served from the site root: `public/textures/hero.jpg`
is at `/textures/hero.jpg`.

Add files with the **exact filenames** below and they appear on the site with
no code changes. Nothing here is required — every slot has a fallback, so the
site works with all of it empty.

---

## `textures/` — backgrounds ← **the two reference images go here**

| Filename | Where it appears | What it needs to be |
|---|---|---|
| `hero.jpg` | Behind the home page hero, full-bleed | The **misty** one. Soft, low detail, empty in the middle — type sits directly on it |
| `accent.jpg` | Behind the `/submit` hero and section bands | The **copper ribbon** one. Loud is fine here; almost no text over it |
| `paper.jpg` *(optional)* | Tiled surface texture under light sections | Flat scan of paper or plaster, no strong features |

**Save the originals, not screenshots.** A screenshot halves the resolution and
re-compresses an already-compressed image, which is very visible once it's
stretched across a full screen.

Ideal: 2000px or wider, JPEG or PNG. They get converted to AVIF/WebP and
resized per device automatically — a 400 KB source lands around 60 KB.

`.jpg` or `.png` both work; keep the name, change the extension.

---

## `brand/` — logo ✅ already in place

Copied from `~/Downloads/Ocham Logo's`. The mark is the Ganesha head with
`OCHAM RECORDS · Est. 1807`.

| File | Use |
|---|---|
| `logo/lockup-dark.svg` | Full lockup in black — for light backgrounds |
| `logo/lockup-light.svg` | Full lockup in white — for dark backgrounds |
| `logo/lockup-on-white.svg` | Same, with a solid white background baked in |
| `logo/lockup-on-black.svg` | Same, with solid black baked in |
| `logo-no-text/*.png` | Mark only, no wordmark — favicon and small sizes |

Prefer the SVGs: they stay sharp at any size and the transparent ones sit on
our sand background instead of punching a white rectangle into it.

---

## `releases/` — artwork

Name each file after the release slug:

```
releases/tidal-drift.jpg
releases/salt-and-static.jpg
```

Square, 1500×1500 or larger. Until a file exists, the site generates a sleeve
from the catalogue number — so the grid never looks broken, it just looks
generic.

---

## `artists/` — portraits

Name after the artist slug:

```
artists/mats-westbroek.jpg
```

Portrait orientation, roughly 4:5, 1600px tall or more. The artist page holds a
correctly-sized empty panel until one exists, so adding it won't reflow the page.

---

## `events/` — optional

Flyers or photos, named after the event. Not wired up yet; ask if you want it.
