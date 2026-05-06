import { Link } from "react-router-dom";

const categories = ["Games", "Apps", "Movies", "Books", "Music"];

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M3.18 23.76a2 2 0 0 0 2.73.74l12.04-6.96-3.42-3.42-11.35 9.64zM20.82 9.09 17.1 6.88l-3.79 3.79 3.79 3.8 3.74-2.22a2 2 0 0 0 0-3.16zM1.05.54A2 2 0 0 0 .68 1.7v20.6a2 2 0 0 0 .37 1.16l.1.1 11.54-11.54v-.27L1.15.44l-.1.1zM14.45 7.55 3.91.59A2 2 0 0 0 1.05.54l11.35 9.63 3.05-2.62z" />
                </svg>
              </div>
              <span className="font-bold text-sm text-foreground">Its Play Store</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Discover and download the best apps and games. Safe, trusted, always up to date.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Browse</h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat}>
                  <Link to={`/category/${cat.toLowerCase()}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Account</h3>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Create Account</Link></li>
              <li><Link to="/search" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Search Apps</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Admin</h3>
            <ul className="space-y-2">
              <li><Link to="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/admin/apps/new" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Add App</Link></li>
              <li><Link to="/admin/categories" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Categories</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Its Play Store. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Built with React + Supabase</p>
        </div>
      </div>
    </footer>
  );
}
