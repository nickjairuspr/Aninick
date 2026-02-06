import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import AnimeCard from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from "@/lib/watchlist";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  const refresh = useCallback(() => {
    setItems(getWatchlist());
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("watchlist-updated", handler);
    return () => window.removeEventListener("watchlist-updated", handler);
  }, [refresh]);

  const handleRemove = (id: string) => {
    removeFromWatchlist(id);
    refresh();
    window.dispatchEvent(new Event("watchlist-updated"));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" data-testid="button-back-watchlist">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-600/20">
          <Heart className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-watchlist-title">My Watchlist</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "anime" : "anime"} saved
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4" data-testid="watchlist-empty">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Heart className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-medium text-muted-foreground">Your watchlist is empty</p>
            <p className="text-sm text-muted-foreground/70">
              Browse anime and tap the heart icon to save your favorites here.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" data-testid="button-browse-anime">
              Browse Anime
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" data-testid="watchlist-grid">
          {items.map((anime) => (
            <div key={anime.id} className="relative group/card">
              <AnimeCard
                id={anime.id}
                title={anime.title}
                image={anime.image}
                type={anime.type}
                sub={anime.sub}
                dub={anime.dub}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(anime.id);
                }}
                className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-red-400 opacity-0 group-hover/card:opacity-100 transition-opacity backdrop-blur-sm"
                data-testid={`button-remove-${anime.id}`}
                title="Remove from watchlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
