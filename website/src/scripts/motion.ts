/**
 * Motion runtime.
 *
 * Deliberately small and framework-free: the page is static HTML, so every effect
 * here is either a scroll listener, a pointer listener or an IntersectionObserver
 * flipping a class. Nothing in this file reads layout during a scroll handler.
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
        el.style.setProperty(
          '--reveal-delay',
          `${Number(el.dataset.revealDelay ?? 0)}ms`,
        );
        el.classList.add('is-in');
        observer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
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

/* ── Pointer spotlight ────────────────────────────────────────────────────── */

function initSpotlight() {
  if (prefersReduced() || !canHover()) return;

  for (const tile of document.querySelectorAll<HTMLElement>('.tile')) {
    const paint = rafThrottle((x: number, y: number) => {
      tile.style.setProperty('--mx', `${x}px`);
      tile.style.setProperty('--my', `${y}px`);
    });

    tile.addEventListener(
      'pointermove',
      (event) => {
        const box = tile.getBoundingClientRect();
        paint(event.clientX - box.left, event.clientY - box.top);
      },
      { passive: true },
    );
  }
}

/* ── Count-up ─────────────────────────────────────────────────────────────── */

function initCounters() {
  const nodes = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!nodes.length || prefersReduced() || !('IntersectionObserver' in window)) return;

  const format = new Intl.NumberFormat('en-US');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);

        const to = Number(el.dataset.count);
        const start = performance.now();
        const run = (now: number) => {
          const t = Math.min((now - start) / 1600, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = format.format(Math.round(to * eased));
          if (t < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
      }
    },
    { threshold: 0.6 },
  );

  nodes.forEach((el) => {
    el.textContent = '0';
    observer.observe(el);
  });
}

/* ── Boot ─────────────────────────────────────────────────────────────────── */

function boot() {
  initHeader();
  initReveal();
  initSpotlight();
  initCounters();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
