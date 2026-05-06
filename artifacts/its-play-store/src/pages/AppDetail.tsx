import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Star, Download, Package, Clock, Shield,
  ChevronRight, Send, Share2, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { App, Screenshot, Review } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import AppCard from "@/components/AppCard";
import EmptyState from "@/components/EmptyState";
import Footer from "@/components/Footer";
import Lightbox from "@/components/Lightbox";
import { useMeta } from "@/hooks/useMeta";

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-4 text-right">{stars}</span>
      <Star className="w-3 h-3 star-filled fill-current shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-6 text-right">{pct}%</span>
    </div>
  );
}

export default function AppDetail() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<App | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarApps, setSimilarApps] = useState<App[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      setLoading(true);
      const { data: appData } = await supabase
        .from("apps")
        .select("*, categories(id, name, icon)")
        .eq("id", id)
        .single();

      if (!appData) { setLoading(false); return; }
      setApp(appData as App);

      const [ssRes, revRes, simRes] = await Promise.all([
        supabase
          .from("screenshots")
          .select("*")
          .eq("app_id", id)
          .order("order", { ascending: true }),
        supabase
          .from("reviews")
          .select("*, users(username, avatar_url)")
          .eq("app_id", id)
          .order("created_at", { ascending: false })
          .limit(20),
        appData.category_id
          ? supabase
              .from("apps")
              .select("*, categories(id, name, icon)")
              .eq("category_id", appData.category_id)
              .neq("id", id)
              .limit(6)
          : Promise.resolve({ data: [] }),
      ]);

      setScreenshots((ssRes.data as Screenshot[]) || []);
      setReviews((revRes.data as Review[]) || []);
      setSimilarApps((simRes.data as App[]) || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setSubmitting(true);
    setReviewError("");
    const { error } = await supabase.from("reviews").insert({
      app_id: id,
      user_id: user.id,
      rating: reviewRating,
      comment: reviewText.trim() || null,
    });
    if (error) {
      setReviewError("Failed to submit review. Please try again.");
    } else {
      setReviewText("");
      setReviewRating(5);
      const { data } = await supabase
        .from("reviews")
        .select("*, users(username, avatar_url)")
        .eq("app_id", id)
        .order("created_at", { ascending: false })
        .limit(20);
      setReviews((data as Review[]) || []);
    }
    setSubmitting(false);
  };

  useMeta({
    title: app?.name,
    description: app?.description?.slice(0, 160) || `Download ${app?.name} by ${app?.developer}`,
    image: app?.icon_url || undefined,
  });

  const ratingCounts = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-secondary" />
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-3xl bg-secondary" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 rounded bg-secondary" />
              <div className="h-4 w-32 rounded bg-secondary" />
              <div className="h-4 w-24 rounded bg-secondary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">App not found.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : app.rating;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* App Header */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="shrink-0 w-24 h-24 rounded-3xl overflow-hidden bg-secondary border border-border/50">
            {app.icon_url ? (
              <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                {app.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-1">{app.name}</h1>
            <p className="text-primary text-sm mb-1">{app.developer}</p>
            {app.categories && (
              <Link
                to={`/category/${encodeURIComponent(app.categories.name)}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
              >
                {app.categories.icon && <span>{app.categories.icon}</span>}
                {app.categories.name}
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 star-filled fill-current" />
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews.length})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Download className="w-4 h-4" />
                {app.downloads.toLocaleString()} downloads
              </div>
              {app.size && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  {app.size}
                </div>
              )}
              {app.version && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  v{app.version}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  const url = window.location.href;
                  await navigator.clipboard.writeText(url).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Share"}
              </button>
              {app.apk_url ? (
                <a
                  href={app.apk_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async () => {
                    await supabase.rpc("increment_downloads", { app_id: app!.id }).catch(() => {
                      supabase.from("apps").update({ downloads: (app!.downloads || 0) + 1 }).eq("id", app!.id);
                    });
                    setApp(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : prev);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download APK
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary text-muted-foreground text-sm cursor-not-allowed">
                  No APK available
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Screenshots */}
        {screenshots.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Screenshots</h2>
            <div className="flex gap-3 overflow-x-auto scroll-smooth-x pb-2">
              {screenshots.map((ss, i) => (
                <button
                  key={ss.id}
                  onClick={() => setLightboxIndex(i)}
                  className="shrink-0 w-44 h-80 rounded-xl overflow-hidden border border-border/50 bg-secondary hover:opacity-90 transition-opacity cursor-zoom-in"
                >
                  {ss.image_url && (
                    <img
                      src={ss.image_url}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Lightbox */}
        {lightboxIndex !== null && screenshots.length > 0 && (
          <Lightbox
            images={screenshots.map(s => s.image_url)}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex(i => i !== null ? (i - 1 + screenshots.length) % screenshots.length : 0)}
            onNext={() => setLightboxIndex(i => i !== null ? (i + 1) % screenshots.length : 0)}
          />
        )}

        {/* Description */}
        {app.description && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">About this app</h2>
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {app.description}
              </p>
            </div>
          </section>
        )}

        {/* App Info */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Version", value: app.version || "—", icon: <Shield className="w-4 h-4" /> },
            { label: "Size", value: app.size || "—", icon: <Package className="w-4 h-4" /> },
            { label: "Downloads", value: app.downloads.toLocaleString(), icon: <Download className="w-4 h-4" /> },
            { label: "Updated", value: new Date(app.created_at).toLocaleDateString(), icon: <Clock className="w-4 h-4" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-card border border-border/50 rounded-xl p-4 flex flex-col gap-1">
              <div className="text-muted-foreground">{icon}</div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </section>

        {/* Ratings */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4">Ratings & Reviews</h2>
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="text-center shrink-0">
                <p className="text-5xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                <div className="flex justify-center gap-0.5 my-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "star-filled fill-current" : "star-empty"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingCounts.map(({ stars, count }) => (
                  <RatingBar key={stars} stars={stars} count={count} total={reviews.length} />
                ))}
              </div>
            </div>

            {/* Submit Review */}
            {user ? (
              <form onSubmit={handleSubmitReview} className="border-t border-border/50 pt-5 mb-5">
                <h3 className="text-sm font-medium text-foreground mb-3">Write a review</h3>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="p-0.5"
                    >
                      <Star className={`w-6 h-6 transition-colors ${s <= reviewRating ? "star-filled fill-current" : "star-empty"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this app (optional)..."
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                {reviewError && <p className="text-xs text-destructive mt-1">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-3 flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Submitting..." : "Submit review"}
                </button>
              </form>
            ) : (
              <div className="border-t border-border/50 pt-5 mb-5">
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">Sign in</Link> to write a review
                </p>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <EmptyState type="reviews" />
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-t border-border/50 pt-4 first:border-0 first:pt-0">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-medium text-foreground">
                        {review.users?.username?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {review.users?.username || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-0.5 mb-1.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "star-filled fill-current" : "star-empty"}`} />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Similar Apps */}
        {similarApps.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-4">Similar Apps</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {similarApps.map((a) => (
                <AppCard key={a.id} app={a} layout="grid" />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
