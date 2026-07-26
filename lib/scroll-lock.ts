/**
 * Utility to reliably lock and unlock page scrolling across standard browser scrolling
 * and Lenis smooth scrolling instances.
 */
export function setScrollLocked(locked: boolean) {
  if (typeof window === 'undefined') return;

  const lenis = (window as any).__lenis;

  if (locked) {
    // Prevent layout shift from scrollbar disappearing
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Stop Lenis smooth scroll engine
    if (lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }
  } else {
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    // Resume Lenis smooth scroll engine
    if (lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  }
}
