const WATCHLIST_KEY = "watchlist";

export interface WatchlistItem {
  id: string;
  title: string;
  image: string;
  type?: string;
  releaseDate?: string;
  sub?: number;
  dub?: number;
}

export function getWatchlist(): WatchlistItem[] {
  try {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(anime: WatchlistItem): void {
  const list = getWatchlist();
  if (!list.some((item) => item.id === anime.id)) {
    list.unshift(anime);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  }
}

export function removeFromWatchlist(id: string): void {
  const list = getWatchlist().filter((item) => item.id !== id);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}

export function isInWatchlist(id: string): boolean {
  return getWatchlist().some((item) => item.id === id);
}
