"use client";
import { useQuery } from "@tanstack/react-query";
import AnimeCard from "@/components/AnimeCard";
import { SectionSkeleton } from "@/components/LoadingSkeleton";
import { TrendingUp, Star, Clock, Play, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface AnimeResult {
  id: string;
  title: string;
  image: string;
  type?: string;
  sub?: number;
  dub?: number;
  episodes?: number;
  url?: string;
}

interface ContinueWatching {
  animeId: string;
  animeTitle: string;
  animeImage: string;
  episodeId: string;
  episodeNumber: number;
  currentTime: number;
  duration: number;
  timestamp: number;
}

function AnimeSection({
  title,
  icon,
  queryKey,
  endpoint,
}: {
  title: string;
  icon: React.ReactNode;
  queryKey: string;
  endpoint: string;
}) {
  const { data, isLoading, error } = useQuery<{ results: AnimeResult[] }>({
    queryKey: [endpoint],
  });

  if (isLoading) return <SectionSkeleton />;
  if (error || !data?.results?.length) return null;

  return (
    <section className="space-y-4" data-testid={`section-${queryKey}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <Link href={`/search?q=${queryKey}`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {data.results.slice(0, 12).map((anime) => (
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
    </section>
  );
}

function ContinueWatchingSection() {
  const [items, setItems] = useState<ContinueWatching[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("continueWatching");
      if (saved) {
        const parsed = JSON.parse(saved) as ContinueWatching[];
        setItems(parsed.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6));
      }
    } catch {}
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="space-y-4" data-testid="section-continue-watching">
      <div className="flex items-center gap-2">
        <Play className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Continue Watching</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link key={item.episodeId} href={`/watch/${encodeURIComponent(item.episodeId)}`}>
            <div className="group relative cursor-pointer rounded-md" data-testid={`continue-${item.episodeId}`}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                <img
                  src={item.animeImage}
                  alt={item.animeTitle}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="h-1 bg-white/20">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${item.duration ? (item.currentTime / item.duration) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-white/80">Episode {item.episodeNumber}</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 px-0.5">
                <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {item.animeTitle}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Discover Anime
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Stream your favorite anime series and movies
        </p>
      </div>

      <ContinueWatchingSection />

      <AnimeSection
        title="Trending Now"
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        queryKey="trending"
        endpoint="/api/anime/trending"
      />

      <AnimeSection
        title="Most Popular"
        icon={<Star className="h-5 w-5 text-yellow-500" />}
        queryKey="popular"
        endpoint="/api/anime/popular"
      />

      <AnimeSection
        title="Recently Updated"
        icon={<Clock className="h-5 w-5 text-emerald-500" />}
        queryKey="recent"
        endpoint="/api/anime/recent"
      />
    </div>
  );
}
