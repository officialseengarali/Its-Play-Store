import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { App, Category } from "@/lib/types";
import Navbar from "@/components/Navbar";
import AppCard from "@/components/AppCard";
import EmptyState from "@/components/EmptyState";
import Footer from "@/components/Footer";
import { SkeletonCard } from "@/components/SkeletonCard";

type SortOption = "downloads" | "rating" | "created_at" | "name";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [apps, setApps] = useState<App[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("cat") || "");
  const [sort, setSort] = useState<SortOption>("downloads");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      setCategories((data as Category[]) || []);
    });
  }, []);

  const doSearch = useCallback(async (q: string, cat: string, sortBy: SortOption) => {
    setLoading(true);
    let req = supabase
      .from("apps")
      .select("*, categories(id, name, icon)")
      .order(sortBy, { ascending: sortBy === "name" })
      .limit(60);

    if (q.trim()) req = req.or(`name.ilike.%${q.trim()}%,developer.ilike.%${q.trim()}%`);
    if (cat) req = req.eq("category_id", cat);

    const { data } = await req;
    setApps((data as App[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("cat") || "";
    setQuery(q);
    setSelectedCategory(cat);
    doSearch(q, cat, sort);
  }, [searchParams]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    const params: Record<string, string> = {};
    if (val.trim()) params.q = val.trim();
    if (selectedCategory) params.cat = selectedCategory;
    setSearchParams(params);
    doSearch(val, selectedCategory, sort);
  };

  const handleCategory = (catId: string) => {
    setSelectedCategory(catId);
    const params: Record<string, string> = {};
    if (query.trim()) params.q = query.trim();
    if (catId) params.cat = catId;
    setSearchParams(params);
    doSearch(query, catId, sort);
  };

  const handleSort = (s: SortOption) => {
    setSort(s);
    doSearch(query, selectedCategory, s);
  };

  const sortLabels: Record<SortOption, string> = {
    downloads: "Most Downloaded",
    rating: "Top Rated",
    created_at: "Newest",
    name: "Name A–Z",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search input */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={handleInput}
            placeholder="Search apps, games, developers..."
            className="w-full bg-card border border-border rounded-2xl pl-12 pr-14 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${showFilters ? "bg-primary/20 text-primary" : "hover:bg-secondary text-muted-foreground"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-card border border-border/50 rounded-2xl p-4 mb-4 space-y-4">
            {/* Category filter */}
            {categories.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Category</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategory("")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === "" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Sort */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Sort By</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(sortLabels) as SortOption[]).map(s => (
                  <button
                    key={s}
                    onClick={() => handleSort(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${sort === s ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                  >
                    {sortLabels[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? "Searching..." : query
              ? `${apps.length} result${apps.length !== 1 ? "s" : ""} for "${query}"`
              : `${apps.length} app${apps.length !== 1 ? "s" : ""}`}
          </p>
          <div className="relative">
            <select
              value={sort}
              onChange={e => handleSort(e.target.value as SortOption)}
              className="appearance-none bg-secondary border border-border rounded-xl pl-3 pr-8 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
            >
              {(Object.keys(sortLabels) as SortOption[]).map(s => (
                <option key={s} value={s}>{sortLabels[s]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
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
