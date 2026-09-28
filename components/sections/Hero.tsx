'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { heroSlides, siteConfig } from '@/data/site';

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const total = heroSlides.length;

  // advance every 6s; restarts whenever the slide changes (also on manual click)
  useEffect(() => {
    const timer = setTimeout(() => setCurrent((c) => (c + 1) % total), 6000);
    return () => clearTimeout(timer);
  }, [current, total]);

  const arrow =
    'absolute top-1/2 hidden -translate-y-1/2 rounded-full bg-black/30 p-3 text-white hover:bg-black/50 sm:block';

  return (
    <section className="relative isolate flex min-h-[85vh] items-center justify-center overflow-hidden text-center">
      {heroSlides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`-z-20 object-cover transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 -z-10 bg-zinc-950/55" />

      <div className="px-6 py-24">
        <h1 className="text-6xl font-semibold text-brand-secondary sm:text-8xl">
          {siteConfig.name}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-secondary/90 sm:text-xl">
          {siteConfig.tagline}
        </p>
        <div className="mt-9">
          <Button href="/menu">View Menu</Button>
        </div>
      </div>

      <button aria-label="Previous slide" className={`${arrow} left-4`} onClick={() => setCurrent((current - 1 + total) % total)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button aria-label="Next slide" className={`${arrow} right-4`} onClick={() => setCurrent((current + 1) % total)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>

      <div className="absolute bottom-6 flex gap-2.5">
        {heroSlides.map((slide, i) => (
          <button
            key={slide.src}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === current}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === current ? 'w-8 bg-brand-secondary' : 'w-2.5 bg-brand-secondary/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
