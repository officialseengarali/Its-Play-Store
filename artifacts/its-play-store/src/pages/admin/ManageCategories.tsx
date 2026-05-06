import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";

const COMMON_ICONS = ["🎮", "📱", "🛠️", "📚", "🎵", "🎬", "🏋️", "💰", "🌐", "📸", "🧭", "🍽️", "🛒", "🎨", "📰", "🏠", "🚗", "✈️", "💊", "🎓"];

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📱");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate("/login");
    });
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories((data as Category[]) || []);
    setLoading(false);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("categories").insert({ name: newName.trim(), icon: newIcon });
    if (!error) {
      setNewName(""); setNewIcon("📱"); setShowAdd(false);
      fetchCategories();
    }
    setAdding(false);
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id); setEditName(cat.name); setEditIcon(cat.icon || "");
  };

  const saveEdit = async () => {
    if (!editId || !editName.trim()) return;
    await supabase.from("categories").update({ name: editName.trim(), icon: editIcon }).eq("id", editId);
    setEditId(null);
    fetchCategories();
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Apps in this category will have no category.`)) return;
    await supabase.from("categories").delete().eq("id", id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const fieldClass = "bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Admin
            </Link>
            <span className="text-border">/</span>
            <span className="text-sm font-medium">Categories</span>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Category
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">Manage Categories</h1>

        {/* Add form */}
        {showAdd && (
          <form onSubmit={handleAdd} className="bg-card border border-primary/30 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold mb-4">New Category</h2>
            <div className="flex gap-3 mb-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Icon</label>
                <input value={newIcon} onChange={e => setNewIcon(e.target.value)} className={`${fieldClass} w-16 text-center text-lg`} maxLength={4} />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Name *</label>
                <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name" className={`${fieldClass} w-full`} />
              </div>
            </div>
            {/* Quick icon picker */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {COMMON_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewIcon(icon)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${newIcon === icon ? "bg-primary/20 border border-primary" : "bg-secondary hover:bg-secondary/80"}`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={adding} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60 hover:bg-primary/90">
                <Save className="w-3.5 h-3.5" /> {adding ? "Adding..." : "Add Category"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl bg-secondary text-foreground text-sm hover:bg-secondary/80">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-secondary" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No categories yet.</p>
            <button onClick={() => setShowAdd(true)} className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
              <Plus className="w-4 h-4" /> Add First Category
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-xl">
                {editId === cat.id ? (
                  <>
                    <input value={editIcon} onChange={e => setEditIcon(e.target.value)} className={`${fieldClass} w-14 text-center text-lg`} maxLength={4} />
                    <input value={editName} onChange={e => setEditName(e.target.value)} className={`${fieldClass} flex-1`} />
                    <button onClick={saveEdit} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditId(null)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-2xl w-8 text-center">{cat.icon}</span>
                    <span className="flex-1 text-sm font-medium text-foreground">{cat.name}</span>
                    <button onClick={() => startEdit(cat)} className="p-2 rounded-lg bg-secondary hover:bg-accent/20 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteCategory(cat.id, cat.name)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
