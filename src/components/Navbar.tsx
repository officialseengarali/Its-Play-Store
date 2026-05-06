import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupaUser } from "@supabase/supabase-js";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<SupaUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-[hsl(0_0%_7%)] border-b border-border/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M3.18 23.76a2 2 0 0 0 2.73.74l12.04-6.96-3.42-3.42-11.35 9.64zM20.82 9.09 17.1 6.88l-3.79 3.79 3.79 3.8 3.74-2.22a2 2 0 0 0 0-3.16zM1.05.54A2 2 0 0 0 .68 1.7v20.6a2 2 0 0 0 .37 1.16l.1.1 11.54-11.54v-.27L1.15.44l-.1.1zM14.45 7.55 3.91.59A2 2 0 0 0 1.05.54l11.35 9.63 3.05-2.62z" />
            </svg>
          </div>
          <span className="hidden sm:block font-semibold text-[15px] text-foreground group-hover:text-primary transition-colors">
            Its Play Store
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps & games"
              className="w-full bg-secondary border border-border rounded-full pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </form>

        {/* User Actions */}
        <div className="flex items-center gap-2 shrink-0 relative">
          {user ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-accent/20 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:block text-sm text-foreground max-w-[100px] truncate">
                  {user.email?.split("@")[0]}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 bg-card border border-border rounded-xl shadow-xl py-2 w-48 z-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
