import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" className="w-10 h-10 fill-primary/40">
            <path d="M3.18 23.76a2 2 0 0 0 2.73.74l12.04-6.96-3.42-3.42-11.35 9.64zM20.82 9.09 17.1 6.88l-3.79 3.79 3.79 3.8 3.74-2.22a2 2 0 0 0 0-3.16zM1.05.54A2 2 0 0 0 .68 1.7v20.6a2 2 0 0 0 .37 1.16l.1.1 11.54-11.54v-.27L1.15.44l-.1.1zM14.45 7.55 3.91.59A2 2 0 0 0 1.05.54l11.35 9.63 3.05-2.62z" />
          </svg>
        </div>
        <h1 className="text-6xl font-black text-foreground/20 mb-2">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-2">Page not found</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          This page doesn't exist or the app you're looking for may have been removed.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          to="/search"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
        >
          <Search className="w-4 h-4" />
          Search Apps
        </Link>
      </div>
    </div>
  );
}
