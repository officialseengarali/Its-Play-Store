import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { App, Category } from "@/lib/types";
import Navbar from "@/components/Navbar";
import AppCard from "@/components/AppCard";
import HeroCarousel from "@/components/HeroCarousel";
import EmptyState from "@/components/EmptyState";
import Footer from "@/components/Footer";
import { useMeta } from "@/hooks/useMeta";

export default function Home() {
  useMeta({ title: "Home", description: "Discover and download the best Android apps and games on Its Play Store." });
  const [featuredApps, setFeaturedApps] = useState<App[]>([]);
  const [topApps, setTopApps] = useState<App[]>([]);
  const [topRated, setTopRated] = useState<App[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [featuredRes, topRes, ratedRes, catRes] = await Promise.all([
        supabase
          .from("apps")
          .select("*, categories(id, name, icon)")
          .eq("is_featured", true)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("apps")
          .select("*, categories(id, name, icon)")
          .order("downloads", { ascending: false })
          .limit(12),
        supabase
          .from("apps")
          .select("*, categories(id, name, icon)")
          .order("rating", { ascending: false })
          .limit(10),
        supabase.from("categories").select("*").order("name").limit(20),
      ]);

      const featured = featuredRes.data || [];
      const top = topRes.data || [];
      const rated = ratedRes.data || [];
      const cats = catRes.data || [];

      setFeaturedApps(featured as App[]);
      setTopApps(top as App[]);
      setTopRated(rated as App[]);
      setCategories(cats as Category[]);
      setIsEmpty(featured.length === 0 && top.length === 0);
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-72 rounded-2xl bg-secondary" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-secondary" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        {isEmpty ? (
          <EmptyState type="apps" />
        ) : (
          <>
            {/* Hero Carousel */}
            {featuredApps.length > 0 && (
              <section>
                <HeroCarousel apps={featuredApps} />
              </section>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Browse Categories</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto scroll-smooth-x pb-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${encodeURIComponent(cat.name)}`}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-primary/10 transition-all text-sm font-medium text-foreground"
                    >
                      {cat.icon && <span className="text-base">{cat.icon}</span>}
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Top Apps */}
            {topApps.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Top Apps</h2>
                  <Link
                    to="/search"
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    See all <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {topApps.slice(0, 12).map((app) => (
                    <AppCard key={app.id} app={app} layout="grid" />
                  ))}
                </div>
              </section>
            )}

            {/* Top Rated */}
            {topRated.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Top Rated</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto scroll-smooth-x pb-2">
                  {topRated.map((app) => (
                    <div key={app.id} className="shrink-0 w-36">
                      <AppCard app={app} layout="grid" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
