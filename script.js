/**
 * Circles 2 — script vanilla
 * Sections : carrousels, trailer (expand scroll), triple marquee (ancien site),
 * galerie type stacking (port du composant React + GSAP).
 */

/* =============================================================================
   Utilitaires
   ============================================================================= */
function shuffleArray(arr, seed) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((seed * (i + 1)) % (i + 1));
    const t = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = t;
  }
  return shuffled;
}

/* =============================================================================
   Carrousels (activités + témoignages)
   ============================================================================= */
function getVisibleCards() {
  return window.matchMedia("(max-width: 768px)").matches ? 1 : 3;
}

function initCarousel(name) {
  const root = document.querySelector(`[data-carousel="${name}"]`);
  if (!root) return;

  const track = root.querySelector(
    name === "activities" ? ".activities-carousel__track" : ".testimonials-carousel__track"
  );
  if (!track) return;

  const cards = track.children;
  const total = cards.length;
  let index = 0;
  function readGapPx() {
    const g = getComputedStyle(track).gap;
    const n = parseFloat(g);
    return Number.isFinite(n) ? n : 16;
  }

  function clampIndex() {
    const visible = getVisibleCards();
    const max = Math.max(0, total - visible);
    if (index > max) index = max;
    if (index < 0) index = 0;
  }

  function layoutAndRender() {
    clampIndex();
    const visible = getVisibleCards();
    const containerW = root.getBoundingClientRect().width;

    if (name === "activities") {
      const gap = readGapPx();
      const cardW = visible > 0 ? (containerW - gap * (visible - 1)) / visible : containerW;
      Array.from(cards).forEach((el) => {
        el.style.flex = `0 0 ${cardW}px`;
        el.style.width = `${cardW}px`;
      });
      const step = cardW + gap;
      track.style.transform = `translateX(-${index * step}px)`;
    } else {
      const cardW = containerW;
      Array.from(cards).forEach((el) => {
        el.style.flex = `0 0 ${cardW}px`;
        el.style.width = `${cardW}px`;
      });
      track.style.transform = `translateX(-${index * cardW}px)`;
    }
  }

  let autoTimer = setInterval(advance, 6000);

  function advance() {
    const visible = getVisibleCards();
    const max = Math.max(0, total - visible);
    index = index >= max ? 0 : index + 1;
    layoutAndRender();
  }

  function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(advance, 6000);
  }

  document.querySelector(`[data-carousel-prev="${name}"]`)?.addEventListener("click", () => {
    index -= 1;
    if (index < 0) index = 0;
    layoutAndRender();
    resetTimer();
  });

  document.querySelector(`[data-carousel-next="${name}"]`)?.addEventListener("click", () => {
    const visible = getVisibleCards();
    const max = Math.max(0, total - visible);
    index += 1;
    if (index > max) index = max;
    layoutAndRender();
    resetTimer();
  });

  window.addEventListener("resize", () => {
    clampIndex();
    layoutAndRender();
  });

  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) < 40) return;
    const visible = getVisibleCards();
    const max = Math.max(0, total - visible);
    if (dx > 0) { index = Math.min(index + 1, max); }
    else { index = Math.max(index - 1, 0); }
    layoutAndRender();
    resetTimer();
  }, { passive: true });

  layoutAndRender();
}

/* =============================================================================
   Trailer — largeur 50vw → 95vw (équivalent GSAP ScrollTrigger revealed-view)
   ============================================================================= */
function initTrailerExpand() {
  const frame = document.querySelector("[data-trailer-expand]");
  if (!frame) return;

  function onScroll() {
    const rect = frame.getBoundingClientRect();
    const vh = window.innerHeight;
    const denom = Math.max(rect.height / 2, 1);
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / denom));
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const widthVw = isMobile ? 80 + progress * 20 : 50 + progress * 35;
    frame.style.width = `${widthVw}vw`;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

/* =============================================================================
   Triple marquee — même logique que `revealed-view.tsx` (shuffle + 3 rangées)
   ============================================================================= */
const ACTIVITY_TICKER_ITEMS = [
  "Rencontre 80 inconnus",
  "Olympiades en équipes",
  "Calvados party",
  "DJ sets & Disco twerk",
  "Découvertes producteurs",
  "Partage ton sport",
  "Running",
  "Yoga",
  "Dégustation produits locaux",
  "Apprends à mixer",
  "Dodo confort",
  "Ventre glisse",
  "Jeux cohésion",
];

function buildTripleMarquee() {
  const root = document.getElementById("triple-marquee-root");
  if (!root) return;

  const activities = [...ACTIVITY_TICKER_ITEMS];
  const activities2 = [
    ...activities.slice(7),
    ...activities.slice(0, 7),
  ];

  const row1 = shuffleArray(activities, 1);
  const row2 = shuffleArray(activities, 334);
  const row3 = shuffleArray(activities2, 32);

  const col = document.createElement("div");
  col.className = "triple-marquee-inner";
  col.style.display = "flex";
  col.style.flexDirection = "column";
  col.style.gap = "0.75rem";

  function makeRow(items, reverse) {
    const row = document.createElement("div");
    row.className = `triple-marquee-row triple-marquee-row--${reverse ? "reverse" : "forward"}`;
    for (let r = 0; r < 4; r++) {
      for (let i = 0; i < items.length; i++) {
        const span = document.createElement("span");
        span.className = "triple-marquee-item";
        span.textContent = `+ ${items[i]}`;
        row.appendChild(span);
      }
    }
    return row;
  }

  col.appendChild(makeRow(row1, false));
  col.appendChild(makeRow(row2, true));
  col.appendChild(makeRow(row3, false));
  root.appendChild(col);
}

/* =============================================================================
   Galerie empilée — port de `stacking-gallery.tsx` (sans GSAP)
   ============================================================================= */
const GALLERY_IMAGES = [
  "/graphics/pictures_v1/DSC00753 1.png",
  "/graphics/pictures_v1/DSC00760 1.png",
  "/graphics/pictures_v1/DSC00801 1.png",
  "/graphics/pictures_v1/DSC00830 1.png",
  "/graphics/pictures_v1/IMG_9065 1.png",
  "/graphics/pictures_v1/IMG_9142 1.png",
  "/graphics/pictures_v1/IMG_9182 1.png",
  "/graphics/pictures_v1/IMG_9262 1.png",
  "/graphics/pictures_v1/DSC00697 1.png",
  "/graphics/pictures_v1/DSC00720 1.png",
];

const ROTATIONS = [-12, 10, -5, 5, -5, -2, 8, -8, 6, -10];
const X_OFFSET_PERCENTS = [-0.25, 0.3, 0, -0.2, 0.25, -0.1, 0.15, -0.3, 0.1, -0.25];
const SCALES = [1, 0.95, 1.25, 0.98, 1.18, 0.9, 1, 0.96, 1.04, 0.91];

function initStackingGallery() {
  const spacer = document.getElementById("stacking-gallery-spacer");
  const overlay = document.querySelector("[data-gallery-overlay]");
  const cardsWrap = document.querySelector("[data-gallery-cards]");
  if (!spacer || !overlay || !cardsWrap) return;

  const totalCards = GALLERY_IMAGES.length;
  const scrollUnits = totalCards + 2;
  spacer.style.setProperty("--gallery-scroll-mult", String(scrollUnits));

  cardsWrap.innerHTML = "";
  const cards = [];

  GALLERY_IMAGES.forEach((src, index) => {
    const el = document.createElement("div");
    el.className = "stack-card";
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Galerie ${index + 1}`;
    el.appendChild(img);
    cardsWrap.appendChild(el);
    cards.push(el);
  });

  function setCardTransforms() {
    const rect = spacer.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const spacerTop = spacer.offsetTop;
    const maxScroll = Math.max(spacer.offsetHeight - window.innerHeight, 1);
    const raw = scrollTop - spacerTop;
    const progress = Math.min(1, Math.max(0, raw / maxScroll));

    const newOpacity = Math.min(progress * 3, 0.7);
    overlay.style.opacity = String(newOpacity);

    const progressPerCard = 1 / totalCards;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    cards.forEach((card, index) => {
      const cardStart = index * progressPerCard;
      let cardProgress = (progress - cardStart) / progressPerCard;
      cardProgress = Math.min(Math.max(cardProgress, 0), 1);

      const baseXOffset = X_OFFSET_PERCENTS[index % X_OFFSET_PERCENTS.length] * vw;
      const baseScale = SCALES[index % SCALES.length];

      let yPos = vh * (1 - cardProgress);
      let xPos = baseXOffset;
      let currentScale = baseScale;

      if (cardProgress === 1 && index < totalCards - 1) {
        const remainingProgress =
          (progress - (cardStart + progressPerCard)) / (1 - (cardStart + progressPerCard));
        if (remainingProgress > 0) {
          const shrinkAmount = Math.min(remainingProgress * 0.15, 0.15);
          currentScale = baseScale * (1 - shrinkAmount);
        }
      }

      card.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px)) scale(${currentScale}) rotate(${ROTATIONS[index % ROTATIONS.length]}deg)`;
    });
  }

  window.addEventListener("scroll", setCardTransforms, { passive: true });
  window.addEventListener("resize", setCardTransforms);
  setCardTransforms();
}

/* =============================================================================
   Témoignages — carrousel infini, 1 carte visible
   ============================================================================= */
function initTestimonialsCarousel() {
  const track = document.querySelector(".testimonials-carousel__track");
  if (!track) return;

  const total = track.children.length;
  if (total === 0) return;

  let index = 0;

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  let autoTimer = setInterval(advance, 6000);

  function advance() {
    index = (index + 1) % total;
    render();
  }

  function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(advance, 6000);
  }

  document.querySelector('[data-carousel-prev="testimonials"]')?.addEventListener("click", () => {
    index = (index - 1 + total) % total;
    render();
    resetTimer();
  });

  document.querySelector('[data-carousel-next="testimonials"]')?.addEventListener("click", () => {
    index = (index + 1) % total;
    render();
    resetTimer();
  });

  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) < 40) return;
    index = dx > 0 ? (index + 1) % total : (index - 1 + total) % total;
    render();
    resetTimer();
  }, { passive: true });

  render();
}

/* =============================================================================
   Reveal au scroll (IntersectionObserver)
   ============================================================================= */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.revealDelay || 0);
        setTimeout(() => entry.target.classList.add("is-revealed"), delay);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
}

/* =============================================================================
   Init page
   ============================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initCarousel("activities");
  initTestimonialsCarousel();
  initTrailerExpand();
  buildTripleMarquee();
  initStackingGallery();
  initReveal();
});
