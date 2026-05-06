import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, Star } from "lucide-react";
import type { App } from "@/lib/types";

interface HeroCarouselProps {
  apps: App[];
}

export default function HeroCarousel({ apps }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % apps.length);
  }, [apps.length]);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + apps.length) % apps.length);
  };

  useEffect(() => {
    if (apps.length <= 1 || paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [apps.length, paused, next]);

  if (apps.length === 0) return null;

  const app = apps[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-card border border-border/50"
      style={{ minHeight: 280 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/50 to-background z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-8 h-full">
        {/* App icon */}
        <div className="shrink-0">
          <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl border border-border/50 bg-secondary">
            {app.icon_url ? (
              <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-muted-foreground">
                {app.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
              Featured
            </span>
            {app.categories && (
              <span className="text-xs text-muted-foreground">{app.categories.name}</span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{app.name}</h2>
          <p className="text-muted-foreground text-sm mb-2">{app.developer}</p>

          {app.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-md">
              {app.description}
            </p>
          )}

          <div className="flex items-center gap-4 justify-center md:justify-start mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 star-filled fill-current" />
              <span className="text-sm font-medium">{app.rating.toFixed(1)}</span>
            </div>
            {app.size && <span className="text-sm text-muted-foreground">{app.size}</span>}
            {app.version && (
              <span className="text-sm text-muted-foreground">v{app.version}</span>
            )}
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <Link
              to={`/app/${app.id}`}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              View App
            </Link>
            {app.apk_url && (
              <a
                href={app.apk_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-sm font-medium hover:bg-accent/20 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download APK
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {apps.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {apps.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {apps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
