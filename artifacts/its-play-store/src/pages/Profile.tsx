import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Star, Edit3, Save, X, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupaUser } from "@supabase/supabase-js";
import type { Review, App } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ReviewWithApp extends Review {
  apps: Pick<App, "id" | "name" | "icon_url">;
}

export default function Profile() {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [username, setUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [reviews, setReviews] = useState<ReviewWithApp[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate("/login"); return; }
      setUser(data.user);
      loadProfile(data.user.id);
    });
  }, []);

  async function loadProfile(uid: string) {
    setLoading(true);
    const [profileRes, reviewsRes] = await Promise.all([
      supabase.from("users").select("username").eq("id", uid).single(),
      supabase
        .from("reviews")
        .select("*, apps(id, name, icon_url)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    if (profileRes.data) setUsername(profileRes.data.username || "");
    setReviews((reviewsRes.data as ReviewWithApp[]) || []);
    setLoading(false);
  }

  const handleSaveUsername = async () => {
    if (!user || !newUsername.trim()) return;
    setSaving(true);
    await supabase.from("users").update({ username: newUsername.trim() }).eq("id", user.id);
    setUsername(newUsername.trim());
    setEditingUsername(false);
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    await supabase.from("reviews").delete().eq("id", reviewId);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const fieldClass = "bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 rounded-2xl bg-secondary" />
            <div className="h-8 rounded bg-secondary w-48" />
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary uppercase shrink-0">
                  {username?.charAt(0) || user?.email?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  {editingUsername ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value)}
                        className={`${fieldClass} flex-1`}
                        placeholder="Your username"
                        autoFocus
                        onKeyDown={e => { if (e.key === "Enter") handleSaveUsername(); if (e.key === "Escape") setEditingUsername(false); }}
                      />
                      <button onClick={handleSaveUsername} disabled={saving} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingUsername(false)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-foreground">{username || "Unnamed User"}</h1>
                      <button
                        onClick={() => { setNewUsername(username); setEditingUsername(true); }}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-5 pt-5 border-t border-border/50">
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">{reviews.length}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
                {reviews.length > 0 && (
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">
                      {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                )}
                <div className="ml-auto">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>

            {/* My Reviews */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">My Reviews</h2>
              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-card border border-border/50 rounded-2xl">
                  <Star className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No reviews yet. Download an app and share your experience!</p>
                  <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">Browse apps</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-card border border-border/50 rounded-xl p-4 flex gap-3">
                      {/* App icon */}
                      <Link to={`/app/${review.apps?.id}`} className="shrink-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-border/50 bg-secondary">
                          {review.apps?.icon_url ? (
                            <img src={review.apps.icon_url} alt={review.apps.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                              {review.apps?.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/app/${review.apps?.id}`} className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate">
                            {review.apps?.name}
                          </Link>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-0.5 my-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "star-filled fill-current" : "star-empty"}`} />
                          ))}
                        </div>
                        {review.comment && <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="mt-2 text-xs text-destructive/70 hover:text-destructive transition-colors"
                        >
                          Delete review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
