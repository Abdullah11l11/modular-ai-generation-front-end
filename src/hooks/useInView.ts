import { useEffect, useRef, useState, type RefObject } from 'react';

type Options = IntersectionObserverInit & { once?: boolean };

/**
 * Tiny IntersectionObserver hook used by `<Reveal>` (and any future
 * scroll-triggered components).
 *
 * - Defaults to `once: true` — once an element enters the viewport it
 *   stays "in view" forever, so the reveal only plays once.
 * - Respects `prefers-reduced-motion`: the observer is skipped and
 *   content is reported as visible from the first render so users who
 *   have asked for less motion see no animation at all.
 */
export function useInView<T extends Element = HTMLDivElement>(
  options: Options = {},
): { ref: RefObject<T | null>; inView: boolean } {
  const { once = true, ...init } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.15, ...init },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return { ref, inView };
}