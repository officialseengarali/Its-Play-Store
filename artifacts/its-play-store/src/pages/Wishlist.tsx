import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { App } from "@/lib/types";
import { useWishlist } from "@/hooks/useWishlist";
import Navbar from "@/components/Navbar";
import AppCard from "@/components/AppCard";
import Footer from "@/components/Footer";
import { useMeta } from "@/hooks/useMeta";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function Wishlist() {
  useMeta({ title: "My Wishlist", description: "Your saved apps and games." });
  const { wishlist, remove } = useWishlist();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlist.length === 0) { setApps([]); return; }
    setLoading(true);
    supabase
      .from("apps")
      .select("*, categories(id, name, icon)")
      .in("id", wishlist)
      .then(({ data }) => {
        setApps((data as App[]) || []);
        setLoading(false);
      });
  }, [wishlist.join(",")]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-red-400 fill-current" />
            <h1 className="text-xl font-bold text-foreground">My Wishlist</h1>
            {apps.length > 0 && (
              <span className="text-sm text-muted-foreground">({apps.length})</span>
            )}
          </div>
          {apps.length > 0 && (
            <button
              onClick={() => { if (confirm("Clear all wishlist items?")) { wishlist.forEach(id => remove(id)); } }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border/50 rounded-2xl">
            <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-base font-medium text-foreground mb-1">No saved apps yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Tap the heart icon on any app to save it here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Apps
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {apps.map(app => <AppCard key={app.id} app={app} layout="grid" />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
