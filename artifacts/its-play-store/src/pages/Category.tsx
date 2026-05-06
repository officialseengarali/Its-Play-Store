import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { App, Category as CategoryType } from "@/lib/types";
import Navbar from "@/components/Navbar";
import AppCard from "@/components/AppCard";
import EmptyState from "@/components/EmptyState";
import Footer from "@/components/Footer";

export default function Category() {
  const { name } = useParams<{ name: string }>();
  const [apps, setApps] = useState<App[]>([]);
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) return;
    async function fetchData() {
      setLoading(true);
      const decoded = decodeURIComponent(name!);

      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("name", decoded)
        .single();

      setCategory((catData as CategoryType) || null);

      if (catData) {
        const { data: appsData } = await supabase
          .from("apps")
          .select("*, categories(id, name, icon)")
          .eq("category_id", catData.id)
          .order("downloads", { ascending: false });
        setApps((appsData as App[]) || []);
      }
      setLoading(false);
    }
    fetchData();
  }, [name]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          {category ? (
            <div className="flex items-center gap-3">
              {category.icon && (
                <span className="text-3xl">{category.icon}</span>
              )}
              <div>
                <h1 className="text-xl font-bold text-foreground">{category.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {apps.length} app{apps.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ) : (
            <h1 className="text-xl font-bold text-foreground">
              {name ? decodeURIComponent(name) : "Category"}
            </h1>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-secondary" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <EmptyState type="category" />
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
