/**
 * Motion runtime (redesign item 46). ES module, no dependencies.
 *
 * The inline <head> script adds `motion-ok` before first paint when motion is
 * allowed, so CSS paints each figure's start state; it removes the class
 * after 3 s unless this file has started. Here: motions play through the
 * Web Animations API on transform, opacity and stroke-dashoffset only, with
 * the easing and durations from the CSS custom properties.
 *
 * Figures opt in with data attributes:
 *   data-motion="draw|align|fanout"   data-motion-start="load|view"
 */

const html = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection && navigator.connection.saveData;
const running = [];

function finishAll() {
  for (const a of running) { try { a.finish(); } catch { /* already finished */ } }
  running.length = 0;
}

function stopMotion() {
  finishAll();
  html.classList.remove('motion-ok');
}

if (!html.classList.contains('motion-ok') || reduce.matches || saveData) {
  stopMotion();
} else {
  html.setAttribute('data-motion-started', '');
  start();
}

function timing() {
  const css = getComputedStyle(html);
  const ms = name => {
    const v = css.getPropertyValue(name).trim();
    return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
  };
  return { ease: css.getPropertyValue('--ease').trim() || 'ease-out', short: ms('--dur-short') || 200, long: ms('--dur-long') || 900 };
}

function animate(el, keyframes, options) {
  const a = el.animate(keyframes, { fill: 'forwards', ...options });
  running.push(a);
  a.finished.then(() => { const i = running.indexOf(a); if (i >= 0) running.splice(i, 1); }).catch(() => {});
  return a;
}

/** The centre-line strokes of a group's masked strands. */
function drawAxes(group) {
  const svg = group.ownerSVGElement || group.closest('svg');
  return [...group.querySelectorAll('[mask]')].map(strand => {
    const id = strand.getAttribute('mask').replace(/^url\(#|\)$/g, '');
    return svg.getElementById(id)?.querySelector('.draw-axis');
  }).filter(Boolean);
}

function play(group) {
  const { ease, short, long } = timing();
  const kind = group.dataset.motion;
  if (kind === 'draw') {
    drawAxes(group).forEach((axis, i) => animate(axis,
      [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: long, delay: i * short, easing: ease }));
  } else if (kind === 'align') {
    animate(group, [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'translateX(0)' }],
      { duration: long, delay: long * 0.6, easing: ease });
  } else if (kind === 'fanout') {
    [...group.children].forEach((strand, i) => animate(strand,
      [{ opacity: 0, transform: 'scaleY(0.2)' }, { opacity: 1, transform: 'scaleY(1)' }],
      { duration: long, delay: i * short, easing: ease }));
  }
}

function start() {
  const groups = [...document.querySelectorAll('[data-motion]')];
  const onView = groups.filter(g => g.dataset.motionStart === 'view');
  const begin = () => {
    if (document.hidden) { stopMotion(); return; }
    groups.filter(g => g.dataset.motionStart === 'load').forEach(play);
    if (onView.length && 'IntersectionObserver' in window) {
      const byTarget = new Map();
      for (const g of onView) {
        const el = g.closest('svg') || g;
        byTarget.set(el, (byTarget.get(el) || []).concat(g));
      }
      const io = new IntersectionObserver(entries => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          byTarget.get(e.target).forEach(play);
        }
      }, { threshold: 0.4 });
      byTarget.forEach((_, el) => io.observe(el));
    } else {
      onView.forEach(play);
    }
  };
  if (document.readyState === 'complete') begin(); else window.addEventListener('load', begin, { once: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  reduce.addEventListener('change', () => { if (reduce.matches) stopMotion(); });
}
