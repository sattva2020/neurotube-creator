import { onMounted, onUnmounted, type Ref } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Vue composable wrapping gsap.context() for automatic cleanup.
 * All GSAP animations created inside the callback are scoped to the
 * provided container element and reverted on component unmount.
 */
export function useGsap(
  containerRef: Ref<HTMLElement | null>,
  animationFn: (ctx: gsap.Context) => void,
) {
  let ctx: gsap.Context | null = null;

  onMounted(() => {
    if (!containerRef.value) {
      console.warn('[useGsap] Container ref is null on mount, skipping animations');
      return;
    }

    console.debug('[useGsap] Creating GSAP context for', containerRef.value.tagName);
    ctx = gsap.context(() => {
      animationFn(ctx!);
    }, containerRef.value);
    console.debug('[useGsap] GSAP context created, animations initialized');
  });

  onUnmounted(() => {
    if (ctx) {
      console.debug('[useGsap] Reverting GSAP context');
      ctx.revert();
      ctx = null;
    }
  });

  return { gsap, ScrollTrigger };
}
