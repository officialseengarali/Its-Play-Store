import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Tag, Star, Users, Plus, ArrowRight, Database } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Stats {
  apps: number;
  categories: number;
  reviews: number;
  users: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ apps: 0, categories: 0, reviews: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate("/login"); return; }
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    async function fetchStats() {
      const [a, c, r, u] = await Promise.all([
        supabase.from("apps").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("users").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        apps: a.count || 0,
        categories: c.count || 0,
        reviews: r.count || 0,
        users: u.count || 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, [user]);

  const statCards = [
    { label: "Total Apps", value: stats.apps, icon: <Package className="w-5 h-5" />, color: "text-primary", link: "/admin/apps" },
    { label: "Categories", value: stats.categories, icon: <Tag className="w-5 h-5" />, color: "text-blue-400", link: "/admin/categories" },
    { label: "Reviews", value: stats.reviews, icon: <Star className="w-5 h-5" />, color: "text-yellow-400", link: "/admin/apps" },
    { label: "Users", value: stats.users, icon: <Users className="w-5 h-5" />, color: "text-purple-400", link: "/admin/apps" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border/60 bg-card">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M3.18 23.76a2 2 0 0 0 2.73.74l12.04-6.96-3.42-3.42-11.35 9.64zM20.82 9.09 17.1 6.88l-3.79 3.79 3.79 3.8 3.74-2.22a2 2 0 0 0 0-3.16zM1.05.54A2 2 0 0 0 .68 1.7v20.6a2 2 0 0 0 .37 1.16l.1.1 11.54-11.54v-.27L1.15.44l-.1.1zM14.45 7.55 3.91.59A2 2 0 0 0 1.05.54l11.35 9.63 3.05-2.62z" />
                </svg>
              </div>
              <span className="font-semibold text-sm">Its Play Store</span>
            </Link>
            <span className="text-border">/</span>
            <span className="text-sm font-medium text-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <Link to="/" className="text-xs text-primary hover:underline">View Store</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your app store</p>
        </div>

        {/* Schema notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Database className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-300">Database setup required</p>
            <p className="text-xs text-yellow-400/80 mt-0.5">
              Run <code className="bg-yellow-500/20 px-1 rounded">schema.sql</code> in your{" "}
              <a href="https://supabase.com/dashboard/project/panbeonjnrqennwnmajk/sql/new" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">
                Supabase SQL Editor
              </a>{" "}
              to create the required tables, then refresh this page.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon, color, link }) => (
            <Link
              key={label}
              to={link}
              className="bg-card border border-border/50 rounded-2xl p-5 hover:border-border transition-colors group"
            >
              <div className={`${color} mb-3`}>{icon}</div>
              <p className="text-2xl font-bold text-foreground">{loading ? "—" : value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                {label}
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Apps</h2>
            <div className="space-y-2">
              <Link
                to="/admin/apps/new"
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New App
              </Link>
              <Link
                to="/admin/apps"
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors"
              >
                <span>Manage All Apps</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Categories</h2>
            <div className="space-y-2">
              <Link
                to="/admin/categories/new"
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Category
              </Link>
              <Link
                to="/admin/categories"
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors"
              >
                <span>Manage Categories</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
