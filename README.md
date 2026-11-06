# Stravous Construction: redesigned site

Static HTML/CSS/JS. No build step and no framework.

## Deploy
1. Copy these files into the root of the existing Netlify project, next to the current `assets/images` and `assets/videos` folders. The pages use those same photos and drone videos (IMG_0667 to IMG_0795, DJI_0399 to DJI_0430).
2. Replace the old `index.html`, `about.html`, `projects.html` and `contact.html`.
3. Deploy. Netlify serves `/about`, `/projects` and `/contact` as before.

## Image links
Photos and videos load from https://stravous-construction.netlify.app/assets/, so the pages also work when opened locally. If the site moves to its own domain, find and replace that address with nothing to make the paths relative again.
The three Abuja city photos on the home page are hotlinked from Unsplash (credited on the image). If one fails to load, its box falls back to plain green.

## What's included
- `index.html`, `about.html`, `projects.html`, `contact.html`
- `assets/css/stravous.css`: all styles
- `assets/js/stravous.js`: header, mobile menu, film play/pause, photo viewer, contact form
- `assets/fonts/`: Archivo and Source Serif 4, self-hosted variable fonts (SIL Open Font License)
- `assets/images/favicon.svg`

## Contact form
The form uses Netlify Forms (`data-netlify="true"`, honeypot spam field). After the first deploy, submissions show up under Site > Forms in Netlify. Turn on email notifications there.

## Before going live
- Replace the placeholder phone numbers (+234 800 000 0000 and +234 800 000 0001) in all four pages.
- Confirm the head office address (Plot 42, Cadastral Zone, Wuye District).
