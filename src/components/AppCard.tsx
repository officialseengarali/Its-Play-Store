import { Link } from "react-router-dom";
import { Star, Download } from "lucide-react";
import type { App } from "@/lib/types";

interface AppCardProps {
  app: App;
  layout?: "grid" | "list";
}

function formatDownloads(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B+`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K+`;
  return String(n);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? "star-filled fill-current" : "star-empty"}`}
        />
      ))}
    </div>
  );
}

export default function AppCard({ app, layout = "grid" }: AppCardProps) {
  const handleInstall = (e: React.MouseEvent) => {
    e.preventDefault();
    if (app.apk_url) {
      window.open(app.apk_url, "_blank", "noopener,noreferrer");
    }
  };

  if (layout === "list") {
    return (
      <Link
        to={`/app/${app.id}`}
        className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/60 transition-colors group"
      >
        <div className="w-14 h-14 rounded-2xl bg-secondary overflow-hidden shrink-0 border border-border/50">
          {app.icon_url ? (
            <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {app.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{app.name}</p>
          <p className="text-xs text-muted-foreground truncate">{app.developer}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={app.rating} />
            <span className="text-xs text-muted-foreground">{app.rating.toFixed(1)}</span>
          </div>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/30"
        >
          Get
        </button>
      </Link>
    );
  }

  return (
    <Link
      to={`/app/${app.id}`}
      className="flex flex-col gap-2 p-3 rounded-xl app-card-hover bg-card border border-border/40 group"
    >
      {/* Icon */}
      <div className="w-full aspect-square rounded-2xl bg-secondary overflow-hidden border border-border/50">
        {app.icon_url ? (
          <img
            src={app.icon_url}
            alt={app.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
            {app.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <p className="font-medium text-sm text-foreground truncate leading-tight">{app.name}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{app.developer}</p>
        {app.categories && (
          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {app.categories.name}
          </span>
        )}
      </div>

      {/* Rating & Downloads */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 star-filled fill-current" />
          <span className="text-xs text-muted-foreground">{app.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Download className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{formatDownloads(app.downloads)}</span>
        </div>
      </div>

      {/* Install button */}
      <button
        onClick={handleInstall}
        className="w-full py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/30 mt-1"
      >
        Install
      </button>
    </Link>
  );
}
