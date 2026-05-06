import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Star, Download, Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { App } from "@/lib/types";

export default function ManageApps() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate("/login");
    });
  }, []);

  async function fetchApps(q = "") {
    setLoading(true);
    let req = supabase.from("apps").select("*, categories(id, name, icon)").order("created_at", { ascending: false });
    if (q.trim()) req = req.ilike("name", `%${q.trim()}%`);
    const { data } = await req;
    setApps((data as App[]) || []);
    setLoading(false);
  }

  useEffect(() => { fetchApps(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await supabase.from("apps").delete().eq("id", id);
    setApps(prev => prev.filter(a => a.id !== id));
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Admin
            </Link>
            <span className="text-border">/</span>
            <span className="text-sm font-medium">Apps</span>
          </div>
          <Link
            to="/admin/apps/new"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New App
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Manage Apps</h1>
          <span className="text-sm text-muted-foreground">{apps.length} app{apps.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={e => { setQuery(e.target.value); fetchApps(e.target.value); }}
            placeholder="Search apps..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-secondary" />)}
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">{query ? "No apps match your search." : "No apps yet. Add your first app."}</p>
            {!query && (
              <Link to="/admin/apps/new" className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Add First App
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {apps.map(app => (
              <div key={app.id} className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-xl hover:border-border transition-colors">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border/50">
                  {app.icon_url ? (
                    <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                      {app.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-foreground truncate">{app.name}</p>
                    {app.is_featured && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">Featured</span>
                    )}
                    {app.categories && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{app.categories.name}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{app.developer}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 star-filled fill-current" />{app.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Download className="w-3 h-3" />{app.downloads.toLocaleString()}
                    </span>
                    {app.version && <span className="text-xs text-muted-foreground">v{app.version}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/admin/apps/edit/${app.id}`}
                    className="p-2 rounded-lg bg-secondary hover:bg-accent/20 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-foreground" />
                  </Link>
                  <button
                    onClick={() => handleDelete(app.id, app.name)}
                    disabled={deleting === app.id}
                    className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
