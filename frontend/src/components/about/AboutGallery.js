"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";

// Add match and meetup photos to /public/images/about-gallery and list them here.
const gallerySlides = [
  { src: "/images/gmca-members-hero.jpg", name: "Team meetup" },
  { src: "/images/about-gallery/subham_bday.jpg", name: "Team meetup" },
  { src: "/images/about-gallery/water_park.jpg", name: "Team meetup" },

];

export default function AboutGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const activeSlide = gallerySlides[activeIndex];

  useEffect(() => {
    if (paused || gallerySlides.length < 2) return undefined;
    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % gallerySlides.length);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [activeIndex, paused]);

  const showSlide = (index) => {
    setActiveIndex((index + gallerySlides.length) % gallerySlides.length);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 48) showSlide(activeIndex + (delta > 0 ? 1 : -1));
    touchStartX.current = null;
  };

  return (
    <section className="border-y bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Our community</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Matches &amp; Meetups</h2>
            <p className="mt-2 text-muted-foreground">Photos from our matches, gatherings, and association events.</p>
          </div>
        </div>

        <div
          className="space-y-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={(event) => {
            if (!event.currentTarget.contains(document.activeElement)) setPaused(false);
          }}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
          }}
        >
          <div
            className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg"
            onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted sm:aspect-[16/8] lg:aspect-[16/7]">
              <Image
                src={activeSlide.src}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="scale-110 object-cover opacity-30 blur-2xl"
                aria-hidden="true"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />
              <Image
                key={activeSlide.src}
                src={activeSlide.src}
                alt={`${activeSlide.name}, GMCA and KMCA`}
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="gallery-photo-enter object-contain p-3 sm:p-5"
                priority={activeIndex === 0}
              />
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur sm:bottom-6 sm:left-6 sm:px-4">
                <Images className="h-4 w-4 text-primary-foreground" />
                {activeSlide.name}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr]">
            <span aria-live="polite" className="text-sm tabular-nums text-muted-foreground sm:justify-self-start">
              {activeIndex + 1} / {gallerySlides.length}
            </span>
            {gallerySlides.length > 1 ? (
              <div className="flex items-center gap-2 sm:justify-self-center">
                <Button variant="outline" size="icon" onClick={() => showSlide(activeIndex - 1)} aria-label="Previous gallery photo">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => showSlide(activeIndex + 1)} aria-label="Next gallery photo">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : <span className="hidden sm:block" />}
            <div className="flex justify-center gap-1.5 sm:justify-self-end" aria-label="Choose a gallery photo">
              {gallerySlides.length > 1 && gallerySlides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => showSlide(index)}
                  className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
                  aria-label={`Show photo ${index + 1}: ${slide.name}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
