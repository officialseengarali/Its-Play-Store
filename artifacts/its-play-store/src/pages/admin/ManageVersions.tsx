import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Package, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { App, AppVersion } from "@/lib/types";

export default function ManageVersions() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<App | null>(null);
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ version: "", apk_url: "", size: "", changelog: "" });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (!data.user) navigate("/login"); });
    if (!appId) return;
    Promise.all([
      supabase.from("apps").select("*").eq("id", appId).single(),
      supabase.from("app_versions").select("*").eq("app_id", appId).order("created_at", { ascending: false }),
    ]).then(([appRes, versRes]) => {
      if (appRes.data) setApp(appRes.data as App);
      setVersions((versRes.data as AppVersion[]) || []);
      setLoading(false);
    });
  }, [appId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId || !form.version.trim()) return;
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("app_versions").insert({
      app_id: appId,
      version: form.version.trim(),
      apk_url: form.apk_url.trim() || null,
      size: form.size.trim() || null,
      changelog: form.changelog.trim() || null,
    });
    if (err) { setError(err.message); setSaving(false); return; }

    // also update the main app's version + apk_url to latest
    if (form.apk_url.trim() || form.version.trim()) {
      const update: Record<string, string> = {};
      if (form.version.trim()) update.version = form.version.trim();
      if (form.apk_url.trim()) update.apk_url = form.apk_url.trim();
      if (form.size.trim()) update.size = form.size.trim();
      await supabase.from("apps").update(update).eq("id", appId);
    }

    const { data } = await supabase.from("app_versions").select("*").eq("app_id", appId).order("created_at", { ascending: false });
    setVersions((data as AppVersion[]) || []);
    setForm({ version: "", apk_url: "", size: "", changelog: "" });
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this version?")) return;
    setDeleting(id);
    await supabase.from("app_versions").delete().eq("id", id);
    setVersions(prev => prev.filter(v => v.id !== id));
    setDeleting(null);
  };

  const fieldClass = "w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider";

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
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/admin/apps" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Apps
          </Link>
          <span className="text-border">/</span>
          <Link to={`/admin/apps/edit/${appId}`} className="text-sm text-muted-foreground hover:text-foreground truncate max-w-[120px]">
            {app?.name}
          </Link>
          <span className="text-border">/</span>
          <span className="text-sm font-medium">Versions</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* App info pill */}
        {app && (
          <div className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary shrink-0">
              {app.icon_url
                ? <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">{app.name.charAt(0)}</div>}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{app.name}</p>
              <p className="text-xs text-muted-foreground">{app.developer} · current v{app.version || "—"}</p>
            </div>
          </div>
        )}

        {/* Add version form */}
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Release New Version
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Version *</label>
                <input required value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))} placeholder="2.0.0" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Size</label>
                <input value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} placeholder="52 MB" className={fieldClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>APK Download URL</label>
              <input type="url" value={form.apk_url} onChange={e => setForm(p => ({ ...p, apk_url: e.target.value }))} placeholder="https://..." className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>What's New / Changelog</label>
              <textarea
                value={form.changelog}
                onChange={e => setForm(p => ({ ...p, changelog: e.target.value }))}
                placeholder={"• Bug fixes and performance improvements\n• New feature added\n• UI redesign"}
                rows={5}
                className={`${fieldClass} resize-none`}
              />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {saving ? "Releasing..." : "Release Version"}
            </button>
          </form>
        </div>

        {/* Version history */}
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Version History ({versions.length})
          </h2>
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No versions released yet.</p>
          ) : (
            <div className="space-y-4">
              {versions.map((v, i) => (
                <div key={v.id} className="flex gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="shrink-0 mt-0.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 0 ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">v{v.version}</span>
                        {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">Latest</span>}
                        {v.size && <span className="text-xs text-muted-foreground">{v.size}</span>}
                      </div>
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deleting === v.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(v.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                    {v.changelog && (
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{v.changelog}</p>
                      </div>
                    )}
                    {v.apk_url && (
                      <a href={v.apk_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary hover:underline">
                        <Package className="w-3 h-3" /> APK link
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
