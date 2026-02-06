"use client";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import AnimeCard from "@/components/AnimeCard";
import { AnimeGridSkeleton } from "@/components/LoadingSkeleton";
import { Search as SearchIcon, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface AnimeResult {
  id: string;
  title: string;
  image: string;
  type?: string;
  sub?: number;
  dub?: number;
  episodes?: number;
}

interface SearchResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: AnimeResult[];
}

export default function SearchPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const query = params.get("q") || "";
  const page = parseInt(params.get("page") || "1");
  const [, setLocation] = useLocation();
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const { data, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ["/api/anime/search", query, page],
    enabled: !!query,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {query ? `Results for "${query}"` : "Search Anime"}
        </h1>

        <form onSubmit={handleSearch} className="max-w-xl" data-testid="form-search-page">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search for anime titles..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary placeholder:text-muted-foreground"
              data-testid="input-search-page"
            />
          </div>
        </form>
      </div>

      {!query && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3" data-testid="search-empty">
          <SearchIcon className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Enter a search term to find anime</p>
        </div>
      )}

      {isLoading && <AnimeGridSkeleton count={18} />}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3" data-testid="search-error">
          <AlertCircle className="h-12 w-12 text-destructive/60" />
          <p className="text-muted-foreground">Something went wrong. Please try again.</p>
        </div>
      )}

      {data && data.results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3" data-testid="search-no-results">
          <SearchIcon className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            No results found for "{query}". Try a different search term.
          </p>
        </div>
      )}

      {data && data.results.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" data-testid="search-results">
            {data.results.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                title={anime.title}
                image={anime.image}
                type={anime.type}
                sub={anime.sub}
                dub={anime.dub}
                episodes={anime.episodes}
              />
            ))}
          </div>

          {data.hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setLocation(`/search?q=${encodeURIComponent(query)}&page=${page + 1}`)
                }
                data-testid="button-load-more"
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
