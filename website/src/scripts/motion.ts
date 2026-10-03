/**
 * Motion runtime.
 *
 * Deliberately small and framework-free: the page is static HTML, so every effect
 * here is either a scroll listener or an IntersectionObserver flipping a class.
 * Nothing in this file reads layout during a scroll handler.
 *
 * Two hard rules:
 *  - Every listener is passive and coalesced into a single rAF.
 *  - Every effect bails out for `prefers-reduced-motion`, and pointer effects
 *    additionally bail for coarse pointers, where there is no hover to speak of.
 */

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const prefersReduced = () => motionQuery.matches;
const canHover = () => finePointer.matches;

/** Coalesces many same-frame callbacks into one. */
function rafThrottle<T extends unknown[]>(fn: (...args: T) => void) {
  let queued = false;
  let latest: T;
  return (...args: T) => {
    latest = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...latest);
    });
  };
}

/* ── Scroll reveal ────────────────────────────────────────────────────────── */

function initReveal() {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!targets.length) return;

  if (prefersReduced() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        // Read the stagger from markup at reveal time rather than inlining a
        // style attribute, so the delay lives next to the delay it staggers.
        el.style.setProperty(
          '--reveal-delay',
          `${Number(el.dataset.revealDelay ?? 0)}ms`,
        );
        el.classList.add('is-in');
        observer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  );

  targets.forEach((el) => observer.observe(el));
}

/* ── Header state + reading progress ──────────────────────────────────────── */

function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  if (!header && !bar) return;

  const sync = rafThrottle(() => {
    const y = window.scrollY;
    header?.toggleAttribute('data-scrolled', y > 12);

    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    }
  });

  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
}

/* ── 3D tilt ──────────────────────────────────────────────────────────────── */

function initTilt() {
  const cards = document.querySelectorAll<HTMLElement>('[data-tilt]');
  if (!cards.length || prefersReduced() || !canHover()) return;

  const MAX_TILT = 4.5;

  for (const card of cards) {
    const paint = rafThrottle((rx: number, ry: number, mx: number, my: number) => {
      card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(mx * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(my * 100).toFixed(1)}%`);
    });

    card.addEventListener(
      'pointermove',
      (event) => {
        const box = card.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;
        card.classList.add('is-tilting');
        // Positive clientY points down, so invert it to tilt "away" from the cursor.
        paint((0.5 - py) * MAX_TILT * 2, (px - 0.5) * MAX_TILT * 2, px, py);
      },
      { passive: true },
    );

    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }
}

/* ── Boot ─────────────────────────────────────────────────────────────────── */

function boot() {
  initHeader();
  initReveal();
  initTilt();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}