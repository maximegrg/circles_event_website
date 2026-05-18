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
   Carrousel activités — tab bar + 3-up cards
   ============================================================================= */
function initActivitiesCarousel() {
  const carousel = document.querySelector('[data-carousel="activities"]');
  if (!carousel) return;

  const cards = Array.from(carousel.querySelectorAll('.activity-card'));
  const N = cards.length;
  if (N === 0) return;

  let activeIndex = 0;
  let autoTimer;

  // --- Build tab bar ---
  const tabBar = document.createElement('div');
  tabBar.className = 'activities-tab-bar';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'carousel-nav__btn';
  prevBtn.setAttribute('aria-label', 'Précédent');
  prevBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;

  const tabsWrap = document.createElement('div');
  tabsWrap.className = 'activities-tab-bar__tabs';

  const indicator = document.createElement('div');
  indicator.className = 'activities-tab-bar__indicator';
  tabsWrap.appendChild(indicator);

  const tabBtns = cards.map((card, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'activities-tab-bar__tab';
    btn.textContent = card.dataset.label || '';
    btn.addEventListener('click', () => { goTo(i); resetTimer(); });
    tabsWrap.appendChild(btn);
    return btn;
  });

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'activities-tab-dots';
  const dots = cards.map((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'activities-tab-dot';
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'carousel-nav__btn';
  nextBtn.setAttribute('aria-label', 'Suivant');
  nextBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

  tabBar.appendChild(prevBtn);
  tabBar.appendChild(tabsWrap);
  tabBar.appendChild(dotsWrap);
  tabBar.appendChild(nextBtn);
  carousel.parentElement.insertBefore(tabBar, carousel);

  // --- Tab indicator position ---
  function updateIndicator() {
    const btn = tabBtns[activeIndex];
    indicator.style.left = btn.offsetLeft + 'px';
    indicator.style.width = btn.offsetWidth + 'px';
  }

  // --- Dot active state ---
  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIndex));
  }

  // --- Navigation ---
  function goTo(idx) {
    const newIdx = ((idx % N) + N) % N;
    if (newIdx === activeIndex && cards[newIdx].classList.contains('is-active')) return;

    const prevIdx = ((newIdx - 1) + N) % N;
    const nextIdx = (newIdx + 1) % N;
    const goingForward = ((newIdx - activeIndex + N) % N) <= N / 2;

    // Card that fully exits the viewport (old is-prev exits left, old is-next exits right)
    const exitingIdx = goingForward
      ? ((activeIndex - 1) + N) % N
      : (activeIndex + 1) % N;
    const exitingCard = cards[exitingIdx];
    const isExitingNewVisible = exitingIdx === prevIdx || exitingIdx === newIdx || exitingIdx === nextIdx;

    // Pre-position an incoming hidden card to enter from off-screen (not from center)
    const incomingIdx = goingForward ? nextIdx : prevIdx;
    const incomingEl = cards[incomingIdx];
    const wasHidden = !incomingEl.classList.contains('is-active') &&
      !incomingEl.classList.contains('is-prev') &&
      !incomingEl.classList.contains('is-next');
    if (wasHidden) {
      const sideLeft = goingForward ? '140%' : '-40%';
      incomingEl.style.transition = 'none';
      incomingEl.style.left = sideLeft;
      incomingEl.style.transform = 'translate(-50%, -50%) scale(0.78)';
      void incomingEl.offsetWidth;
      incomingEl.style.transition = '';
      incomingEl.style.left = '';
      incomingEl.style.transform = '';
    }

    // Animate exiting card off-screen in the correct direction
    if (!isExitingNewVisible) {
      exitingCard.style.transition = 'none';
      exitingCard.style.left = goingForward ? '5%' : '95%';
      exitingCard.style.transform = 'translate(-50%, -50%) scale(0.78)';
      exitingCard.style.opacity = '0.6';
      void exitingCard.offsetWidth;
      exitingCard.style.transition = '';
      exitingCard.style.left = goingForward ? '-40%' : '140%';
      exitingCard.style.opacity = '0';
      setTimeout(() => {
        if (!exitingCard.classList.contains('is-active') &&
          !exitingCard.classList.contains('is-prev') &&
          !exitingCard.classList.contains('is-next')) {
          exitingCard.style.transition = 'none';
          exitingCard.style.left = '';
          exitingCard.style.transform = '';
          exitingCard.style.opacity = '';
          void exitingCard.offsetWidth;
          exitingCard.style.transition = '';
        }
      }, 550);
    }

    // Re-assign classes; clear any leftover inline styles on newly visible cards
    cards.forEach(c => {
      c.classList.remove('is-active', 'is-prev', 'is-next');
      c.onclick = null;
    });

    [prevIdx, newIdx, nextIdx].forEach(i => {
      const c = cards[i];
      if (c.style.cssText) {
        c.style.transition = 'none';
        c.style.left = '';
        c.style.transform = '';
        c.style.opacity = '';
        void c.offsetWidth;
        c.style.transition = '';
      }
    });

    cards[prevIdx].classList.add('is-prev');
    cards[prevIdx].onclick = () => { goTo(activeIndex - 1); resetTimer(); };
    cards[newIdx].classList.add('is-active');
    cards[nextIdx].classList.add('is-next');
    cards[nextIdx].onclick = () => { goTo(activeIndex + 1); resetTimer(); };

    activeIndex = newIdx;
    updateIndicator();
    updateDots();
  }

  function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(activeIndex + 1), 8000);
  }

  prevBtn.addEventListener('click', () => { goTo(activeIndex - 1); resetTimer(); });
  nextBtn.addEventListener('click', () => { goTo(activeIndex + 1); resetTimer(); });

  // Touch swipe
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) < 40) return;
    goTo(dx > 0 ? activeIndex + 1 : activeIndex - 1);
    resetTimer();
  }, { passive: true });

  // Init: position indicator without animation, then enable transitions
  requestAnimationFrame(() => {
    indicator.style.transition = 'none';
    goTo(0);
    requestAnimationFrame(() => {
      indicator.style.transition = '';
      resetTimer();
    });
  });
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
  "DJ sets & Disco boom",
  "Découvertes producteurs locaux",
  "Partage ta passion",
  "Running collectif",
  "Yoga & bien-être",
  "Apprends à mixer",
  "Dodo confort",
  "Ventre glisse deluxe",
  "Jeux de cohésion",
  "Murder party géante",
  "Tournoi de Beer Pong géant",
  "Cours de danse",
  "Stand de crêpes",
  "Volleyball",
  "Buffet à volonté",
  "Boissons et cocktails",
  "Stand up"
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
  { src: "graphics/galery/DSC00706 1.png",  portrait: false },
  { src: "graphics/galery/DSC00720 5.png",  portrait: true  },
  { src: "graphics/galery/DSC00760 2.png",  portrait: true  },
  { src: "graphics/galery/DSC00778 1.png",  portrait: true  },
  { src: "graphics/galery/DSC00789 1.png",  portrait: false },
  { src: "graphics/galery/DSC00799 1.png",  portrait: true  },
  { src: "graphics/galery/DSC00801 5.png",  portrait: false },
  { src: "graphics/galery/DSC00830 2.png",  portrait: false },
  { src: "graphics/galery/DSC00835 1.png",  portrait: false },
  { src: "graphics/galery/DSC00853 1.png",  portrait: true  },
  { src: "graphics/galery/DSC00869 1.png",  portrait: true  },
  { src: "graphics/galery/IMG_8735 1.png",  portrait: false },
  { src: "graphics/galery/IMG_8738 1.png",  portrait: false },
  { src: "graphics/galery/IMG_8843 1.png",  portrait: true  },
  { src: "graphics/galery/IMG_9019 1.png",  portrait: false },
  { src: "graphics/galery/IMG_9022 1.png",  portrait: true  },
  { src: "graphics/galery/IMG_9036 1.png",  portrait: true  },
  { src: "graphics/galery/IMG_9065 2.png",  portrait: false },
  { src: "graphics/galery/IMG_9182 2.png",  portrait: false },
  { src: "graphics/galery/IMG_9262 2.png",  portrait: false },
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

  GALLERY_IMAGES.forEach((item, index) => {
    const el = document.createElement("div");
    el.className = "stack-card" + (item.portrait ? " is-portrait" : "");
    const img = document.createElement("img");
    img.src = item.src;
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
   Menu mobile — burger toggle
   ============================================================================= */
function initMobileMenu() {
  const burger = document.querySelector('.nav-bar__burger');
  const menu = document.querySelector('.mobile-menu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('is-open');
    menu.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
  });

  menu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('is-open');
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    });
  });
}

/* =============================================================================
   Hero video — autoplay explicite pour Safari
   ============================================================================= */
function initHeroVideo() {
  const video = document.querySelector('.hero__video');
  if (!video) return;
  video.muted = true;
  const p = video.play();
  if (p !== undefined) {
    p.catch(() => {
      // Safari bloqué (Low Power Mode, etc.) → le poster reste affiché
    });
  }
}

/* =============================================================================
   Init page
   ============================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initHeroVideo();
  initActivitiesCarousel();
  initTestimonialsCarousel();
  initTrailerExpand();
  buildTripleMarquee();
  initStackingGallery();
  initReveal();
  initMobileMenu();
});
