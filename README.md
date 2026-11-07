# Stravous Construction: redesigned site

Static HTML/CSS/JS. No build step and no framework.

## Deploy
Upload this whole folder (pages plus `assets`) to Netlify. Everything the site needs is inside it. The only outside files are the three credited Abuja city photos on the home page, which load from Unsplash.

## Speed
- Photos: `assets/img/img-XXXX-{640,1280,1920}.webp`. Each page lets the browser pick the smallest size that looks sharp on the visitor's screen. 175 MB of original JPGs became about 31 MB in total, and a phone visitor downloads roughly 60 KB per photo.
- Videos: `assets/video/dji-XXXX-{720,1080}.mp4` plus a `-poster.webp` frame each, with no audio and set to start playing before they finish downloading. Phones get the 720p version. Only the hero video loads with the page; the others load when a visitor scrolls near them, and pause when off screen.
- Fonts and scripts are local. The original JPG/MP4 files are not used by the site any more.

## What's included
- `index.html`, `about.html`, `projects.html`, `contact.html`
- `assets/css/stravous.css`: all styles
- `assets/js/stravous.js`: header, mobile menu, film play/pause, photo viewer, contact form
- `assets/fonts/`: Archivo and Source Serif 4, self-hosted variable fonts (SIL Open Font License)
- `assets/brand/`: logo (`logo-440.webp` for the site, `logo.png` full size with a transparent background), favicons, app icons and `site.webmanifest`
- `assets/img/`, `assets/video/`: compressed photos and videos

## Light and dark mode
The moon/sun button in the header switches themes. The site follows the visitor's system setting (light or dark) until they press the button, then remembers their choice. The header is always dark so the white chrome logo shows in both themes. All colours live as variables at the top of `assets/css/stravous.css` (`:root` for light, `[data-theme="dark"]` for dark).

## Contact form
The form uses Netlify Forms (`data-netlify="true"`, honeypot spam field). After the first deploy, submissions show up under Site > Forms in Netlify. Turn on email notifications there.

## Before going live
- Replace the placeholder phone numbers (+234 800 000 0000 and +234 800 000 0001) in all four pages.
- Confirm the head office address (Plot 42, Cadastral Zone, Wuye District).
