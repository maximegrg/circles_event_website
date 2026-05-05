# Circles 2 — Site web

Site statique pour l'événement **Circles 2026**, un weekend de 4 jours en Normandie (Argentan, 4-7 septembre 2026).

## Stack

- HTML / CSS / JS vanilla — aucun framework, aucun build step
- Déployé sur **Vercel** (clean URLs activées)

## Structure

```
index.html          page principale
mentions-legales.html
style.css
script.js
graphics/           images, logo, vidéo hero
vercel.json         config Vercel (cleanUrls, no trailingSlash)
```

## Fonctionnalités

- Ticker haut animé + nav sticky desktop
- Hero vidéo plein écran avec bouton billetterie (Luma)
- Carrousel activités et carrousel témoignages (swipe mobile)
- Trailer YouTube avec expansion au scroll
- Triple marquee d'activités
- Galerie stacking au scroll
- Section infos FAQ
- Footer avec lien billetterie et mentions légales
- Animations d'apparition au scroll (IntersectionObserver)

## Contact

[contact@circles-event.eu](mailto:contact@circles-event.eu)
