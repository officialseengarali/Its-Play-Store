import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, History } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Category, Screenshot } from "@/lib/types";

interface AppFormData {
  name: string;
  developer: string;
  category_id: string;
  description: string;
  icon_url: string;
  apk_url: string;
  version: string;
  size: string;
  rating: string;
  downloads: string;
  is_featured: boolean;
  status: "live" | "draft" | "suspended";
}

const EMPTY: AppFormData = {
  name: "", developer: "", category_id: "", description: "",
  icon_url: "", apk_url: "", version: "", size: "",
  rating: "0", downloads: "0", is_featured: false, status: "live",
};

export default function AppForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<AppFormData>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [screenshots, setScreenshots] = useState<{ url: string; order: number }[]>([]);
  const [existingScreenshots, setExistingScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate("/login");
    });
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      setCategories((data as Category[]) || []);
    });
    if (isEdit) {
      Promise.all([
        supabase.from("apps").select("*").eq("id", id).single(),
        supabase.from("screenshots").select("*").eq("app_id", id).order("order"),
      ]).then(([appRes, ssRes]) => {
        if (appRes.data) {
          const a = appRes.data;
          setForm({
            name: a.name || "", developer: a.developer || "",
            category_id: a.category_id || "", description: a.description || "",
            icon_url: a.icon_url || "", apk_url: a.apk_url || "",
            version: a.version || "", size: a.size || "",
            rating: String(a.rating ?? 0), downloads: String(a.downloads ?? 0),
            is_featured: a.is_featured || false,
            status: (a.status as "live" | "draft" | "suspended") || "live",
          });
        }
        setExistingScreenshots((ssRes.data as Screenshot[]) || []);
        setLoading(false);
      });
    }
  }, [id]);

  const set = (key: keyof AppFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      developer: form.developer.trim(),
      category_id: form.category_id || null,
      description: form.description.trim() || null,
      icon_url: form.icon_url.trim() || null,
      apk_url: form.apk_url.trim() || null,
      version: form.version.trim() || null,
      size: form.size.trim() || null,
      rating: parseFloat(form.rating) || 0,
      downloads: parseInt(form.downloads) || 0,
      is_featured: form.is_featured,
      status: form.status,
    };

    let appId = id;

    if (isEdit) {
      const { error: err } = await supabase.from("apps").update(payload).eq("id", id!);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { data, error: err } = await supabase.from("apps").insert(payload).select().single();
      if (err) { setError(err.message); setSaving(false); return; }
      appId = data.id;
    }

    // Add new screenshots
    for (const ss of screenshots) {
      if (ss.url.trim()) {
        await supabase.from("screenshots").insert({
          app_id: appId,
          image_url: ss.url.trim(),
          order: ss.order,
        });
      }
    }

    navigate("/admin/apps");
  };

  const deleteScreenshot = async (ssId: string) => {
    await supabase.from("screenshots").delete().eq("id", ssId);
    setExistingScreenshots(prev => prev.filter(s => s.id !== ssId));
  };

  const fieldClass = "w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin/apps" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Apps
            </Link>
            <span className="text-border">/</span>
            <span className="text-sm font-medium">{isEdit ? "Edit App" : "New App"}</span>
          </div>
          {isEdit && (
            <Link
              to={`/admin/apps/${id}/versions`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <History className="w-4 h-4" /> Version History
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>App Name *</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="My Awesome App" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Developer *</label>
                <input required value={form.developer} onChange={e => set("developer", e.target.value)} placeholder="Company Name" className={fieldClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select value={form.category_id} onChange={e => set("category_id", e.target.value)} className={fieldClass}>
                <option value="">Select category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                rows={4}
                placeholder="Describe what this app does..."
                className={`${fieldClass} resize-none`}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.is_featured}
                onChange={e => set("is_featured", e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="featured" className="text-sm text-foreground">Feature this app in the hero carousel</label>
            </div>
            <div>
              <label className={labelClass}>App Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={fieldClass}>
                <option value="live">🟢 Live — visible to everyone</option>
                <option value="draft">🟡 Draft — hidden from store</option>
                <option value="suspended">🔴 Suspended — removed from store</option>
              </select>
            </div>
          </div>

          {/* Media */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Media</h2>
            <div>
              <label className={labelClass}>App Icon URL</label>
              <input value={form.icon_url} onChange={e => set("icon_url", e.target.value)} placeholder="https://..." type="url" className={fieldClass} />
              {form.icon_url && (
                <div className="mt-2 w-14 h-14 rounded-2xl overflow-hidden border border-border/50">
                  <img src={form.icon_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Screenshots */}
            <div>
              <label className={labelClass}>Screenshots</label>
              {existingScreenshots.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                  {existingScreenshots.map(ss => (
                    <div key={ss.id} className="relative shrink-0">
                      <div className="w-20 h-36 rounded-lg overflow-hidden border border-border/50 bg-secondary">
                        {ss.image_url && <img src={ss.image_url} alt="Screenshot" className="w-full h-full object-cover" />}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteScreenshot(ss.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                {screenshots.map((ss, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={ss.url}
                      onChange={e => setScreenshots(prev => prev.map((s, j) => j === i ? { ...s, url: e.target.value } : s))}
                      placeholder="Screenshot URL (https://...)"
                      type="url"
                      className={`${fieldClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => setScreenshots(prev => prev.filter((_, j) => j !== i))}
                      className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setScreenshots(prev => [...prev, { url: "", order: prev.length }])}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add screenshot URL
                </button>
              </div>
            </div>
          </div>

          {/* Download */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Download & Release</h2>
            <div>
              <label className={labelClass}>APK Download URL</label>
              <input value={form.apk_url} onChange={e => set("apk_url", e.target.value)} placeholder="https://... (Supabase Storage URL)" type="url" className={fieldClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Version</label>
                <input value={form.version} onChange={e => set("version", e.target.value)} placeholder="1.0.0" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Size</label>
                <input value={form.size} onChange={e => set("size", e.target.value)} placeholder="45 MB" className={fieldClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Rating (0–5)</label>
                <input value={form.rating} onChange={e => set("rating", e.target.value)} type="number" min="0" max="5" step="0.1" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Download Count</label>
                <input value={form.downloads} onChange={e => set("downloads", e.target.value)} type="number" min="0" className={fieldClass} />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <Link to="/admin/apps" className="px-5 py-2.5 rounded-xl bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : (isEdit ? "Save Changes" : "Create App")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
