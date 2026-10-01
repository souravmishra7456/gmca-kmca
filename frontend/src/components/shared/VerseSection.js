"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const odiaFont = "'Noto Serif Oriya', 'Noto Sans Oriya', 'Noto Sans Oriya UI', Kalinga, serif";

export default function VerseSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;
    section.classList.add("verse-reveal-ready");
    const bounds = section.getBoundingClientRect();
    const alreadyInView = bounds.top < window.innerHeight && bounds.bottom > 0;
    if (alreadyInView) {
      requestAnimationFrame(() => section.classList.add("verse-reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        requestAnimationFrame(() => section.classList.add("verse-reveal-visible"));
        observer.disconnect();
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="gita-verse-title"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden border-y border-border/60 bg-muted/20 py-8 text-foreground sm:py-10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_20%,rgba(174,132,51,0.10),transparent_42%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/4 -z-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-7 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:px-8">
        <div className="verse-panel relative order-2 rounded-2xl border border-amber-600/30 bg-card/95 p-5 shadow-[0_20px_60px_rgba(120,85,25,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm sm:p-8 lg:order-1 lg:p-10 dark:border-amber-300/25 dark:shadow-[0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <span aria-hidden="true" className="absolute left-3 top-3 h-5 w-5 border-l border-t border-amber-700/55 sm:left-4 sm:top-4 sm:h-7 sm:w-7 dark:border-amber-300/65" />
          <span aria-hidden="true" className="absolute bottom-3 right-3 h-5 w-5 border-b border-r border-amber-700/55 sm:bottom-4 sm:right-4 sm:h-7 sm:w-7 dark:border-amber-300/65" />

          <p className="mb-4 inline-flex rounded-full border border-amber-700/25 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-900 sm:mb-5 sm:text-xs dark:border-amber-300/25 dark:text-amber-200">
            Bhagavad Gita · Chapter 2 · Verse 47
          </p>
          <h2 id="gita-verse-title" className="sr-only">A timeless teaching from the Bhagavad Gita</h2>
          <p
            lang="or"
            className="font-serif text-xl font-bold leading-[1.9] text-amber-900 [text-shadow:0_1px_0_rgba(255,255,255,0.72),0_2px_2px_rgba(96,62,10,0.22)] sm:text-2xl lg:text-[1.7rem] dark:text-amber-200 dark:[text-shadow:0_1px_0_rgba(255,255,255,0.16),0_2px_5px_rgba(0,0,0,0.42)]"
            style={{ fontFamily: odiaFont }}
          >
            କର୍ମଣ୍ୟେବାଧିକାରସ୍ତେ ମା ଫଳେଷୁ କଦାଚନ।<br />
            ମା କର୍ମଫଳହେତୁର୍ଭୂର୍ମା ତେ ସଙ୍ଗୋଽସ୍ତ୍ୱକର୍ମଣି॥
          </p>
          <div aria-hidden="true" className="verse-ornament my-5 flex items-center gap-3 sm:my-6">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-600/55 to-amber-600/25 dark:via-amber-300/55 dark:to-amber-300/25" />
            <span className="h-2 w-2 rotate-45 border border-amber-700/70 bg-amber-500/20 dark:border-amber-300/80 dark:bg-amber-300/20" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-600/55 to-amber-600/25 dark:via-amber-300/55 dark:to-amber-300/25" />
          </div>
          <p lang="en" className="text-sm font-medium italic leading-relaxed text-foreground/80 sm:text-base">
            “You have the right to perform your duty, but never to its results. Do not make the fruits of your actions your motive, and do not become attached to inaction.”
          </p>
          <p lang="or" className="mt-5 text-right text-xs font-semibold tracking-wide text-amber-800 sm:text-sm dark:text-amber-200" style={{ fontFamily: odiaFont }}>
            ॥ ଶ୍ରୀମଦ୍‌ଭଗବଦ୍‌ଗୀତା ॥
          </p>
        </div>

        <div className="verse-artwork-frame relative order-1 mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-amber-700/25 bg-card shadow-[0_24px_70px_rgba(80,55,20,0.18)] dark:border-amber-300/25 dark:shadow-[0_24px_70px_rgba(0,0,0,0.4)] lg:order-2">
          <Image
            src="/images/krishna-arjuna-gita.png"
            alt="Lord Krishna guiding Arjuna on the battlefield"
            width={1246}
            height={894}
            sizes="(max-width: 1024px) 100vw, 56vw"
            className="h-auto max-h-[38svh] w-full object-contain sm:max-h-[46svh] lg:max-h-[68svh]"
            priority={false}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/35 dark:ring-white/10" />
        </div>
      </div>
    </section>
  );
}
