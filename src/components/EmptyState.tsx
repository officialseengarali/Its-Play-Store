import { PackageOpen, Search } from "lucide-react";

interface EmptyStateProps {
  type?: "apps" | "search" | "category" | "reviews";
  message?: string;
}

export default function EmptyState({ type = "apps", message }: EmptyStateProps) {
  const config = {
    apps: {
      icon: <PackageOpen className="w-12 h-12 text-muted-foreground/50" />,
      title: "No apps yet",
      description: message || "Apps will appear here once they are added to the store.",
    },
    search: {
      icon: <Search className="w-12 h-12 text-muted-foreground/50" />,
      title: "No apps found",
      description: message || "Try a different search term or browse by category.",
    },
    category: {
      icon: <PackageOpen className="w-12 h-12 text-muted-foreground/50" />,
      title: "No apps in this category",
      description: message || "Check back later for apps in this category.",
    },
    reviews: {
      icon: (
        <svg className="w-12 h-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      title: "No reviews yet",
      description: message || "Be the first to review this app.",
    },
  };

  const { icon, title, description } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 p-4 rounded-full bg-secondary/50">{icon}</div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
