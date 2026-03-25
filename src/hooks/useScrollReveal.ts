"use client";
import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement>(
  options: { threshold?: number; rootMargin?: string; once?: boolean } = {}
) {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin = "0px 0px -50px 0px", once = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          if (once) observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
