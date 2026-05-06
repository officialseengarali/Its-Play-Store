import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { App } from "@/lib/types";
import Navbar from "@/components/Navbar";
import AppCard from "@/components/AppCard";
import EmptyState from "@/components/EmptyState";
import Footer from "@/components/Footer";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    setLoading(true);
    let req = supabase
      .from("apps")
      .select("*, categories(id, name, icon)")
      .order("downloads", { ascending: false })
      .limit(50);

    if (q.trim()) {
      req = req.or(`name.ilike.%${q.trim()}%,developer.ilike.%${q.trim()}%`);
    }

    const { data } = await req;
    setApps((data as App[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    doSearch(query);
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    doSearch(q);
  }, [searchParams]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    const params: Record<string, string> = {};
    if (val.trim()) params.q = val.trim();
    setSearchParams(params);
    doSearch(val);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search input */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={handleInput}
            placeholder="Search apps, games, developers..."
            className="w-full bg-card border border-border rounded-2xl pl-12 pr-12 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
          />
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? "Searching..." : query ? `${apps.length} result${apps.length !== 1 ? "s" : ""} for "${query}"` : `${apps.length} app${apps.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-secondary" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <EmptyState type="search" message={query ? `No apps found for "${query}"` : undefined} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} layout="grid" />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
