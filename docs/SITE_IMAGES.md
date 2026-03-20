# Site photos

## Academy photos (your team)

These live under **`public/`** — homepage hero, **Our Moments** carousel, About founder shot, programs, scholarships, etc.

| Path | Use |
|------|-----|
| `/hero.png` | Home hero |
| `/gallery/gallery-1.png` … `gallery-4.png` | **Our Moments** carousel (4 slides) |
| `/gallery/gallery-5.png`, `gallery-7.png` | Duplicates for scholarships / programs where needed |
| `/gallery/gallery-7.png` | Programs page banner (optional) |

**Replacing images:** Keep the same filenames; prefer landscape for hero. Run `npm run build` after changes.

## Store (merchandise)

Product thumbnails use **stock product photography** from Unsplash (see `lib/merchandise.ts`) so each listing shows the type of item sold (shoes, jersey, ball, cones, etc.). Academy photos are **not** used in the shop.

To swap in **your own pack shots**, replace `imageUrl` values with paths like `/merch/your-ball.jpg` under `public/merch/`.
