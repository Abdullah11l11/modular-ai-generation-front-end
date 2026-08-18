import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/useInView';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger the reveal of siblings within a section. */
  delayMs?: number;
};

/**
 * Scroll-reveal wrapper.
 *
 * Wraps a section's inner content and fades+slides it in once it enters
 * the viewport. Driven by `useInView` (IntersectionObserver). Honours
 * `prefers-reduced-motion` — content is visible from the first paint
 * for users who have asked for less motion.
 *
 * Use as the immediate child of a `<section>`'s content container so
 * the reveal respects the section's layout box, not the viewport.
 */
export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const localRef = useRef<HTMLDivElement | null>(null);

  // Fan out the observer's element + our ref so both `useInView` and
  // the consumer see the same DOM node.
  const setRefs = (node: HTMLDivElement | null) => {
    ref.current = node;
    localRef.current = node;
  };

  return (
    <div
      ref={setRefs}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        inView ? 'opacity-100 translate-y-0' : 'translate-y-4 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}