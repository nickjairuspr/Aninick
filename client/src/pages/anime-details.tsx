"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { AnimeDetailsSkeleton } from "@/components/LoadingSkeleton";
import EpisodeCard from "@/components/EpisodeCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Calendar,
  Clock,
  Star,
  AlertCircle,
  ArrowLeft,
  Subtitles,
  Mic,
  Tv,
  Film,
  Heart,
} from "lucide-react";
import {
  isInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  type WatchlistItem,
} from "@/lib/watchlist";
import { useState, useEffect } from "react";

interface Episode {
  id: string;
  number: number;
  title?: string;
  isFiller?: boolean;
}

interface AnimeInfo {
  id: string;
  title: string;
  image: string;
  cover?: string;
  description?: string;
  genres?: string[];
  status?: string;
  type?: string;
  releaseDate?: string;
  totalEpisodes?: number;
  subOrDub?: string;
  episodes: Episode[];
  rating?: number;
  duration?: string;
  studios?: string[];
  season?: string;
  synonyms?: string[];
  otherName?: string;
  url?: string;
  sub?: number;
  dub?: number;
}

export default function AnimeDetails() {
  const params = useParams<{ id: string }>();
  const id = params.id ? decodeURIComponent(params.id) : "";
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<string>>(new Set());
  const [inWatchlist, setInWatchlist] = useState(false);

  const { data, isLoading, error } = useQuery<AnimeInfo>({
    queryKey: ["/api/anime/info", id],
    enabled: !!id,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("continueWatching");
      if (saved) {
        const items = JSON.parse(saved) as Array<{ episodeId: string }>;
        setWatchedEpisodes(new Set(items.map((i) => i.episodeId)));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (id) setInWatchlist(isInWatchlist(id));
  }, [id]);

  const toggleWatchlist = () => {
    if (!data) return;
    const item: WatchlistItem = {
      id: data.id,
      title: data.title,
      image: data.image,
      type: data.type,
      releaseDate: data.releaseDate,
      sub: data.sub,
      dub: data.dub,
    };
    if (inWatchlist) {
      removeFromWatchlist(data.id);
      setInWatchlist(false);
    } else {
      addToWatchlist(item);
      setInWatchlist(true);
    }
    window.dispatchEvent(new Event("watchlist-updated"));
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <AnimeDetailsSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3" data-testid="details-error">
          <AlertCircle className="h-12 w-12 text-destructive/60" />
          <p className="text-muted-foreground">Failed to load anime details.</p>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const firstEpisode = data.episodes?.[0];
  const description = data.description
    ?.replace(/<[^>]*>/g, "")
    ?.replace(/&amp;/g, "&")
    ?.replace(/&lt;/g, "<")
    ?.replace(/&gt;/g, ">")
    ?.replace(/&quot;/g, '"')
    ?.replace(/&#39;/g, "'");

  return (
    <div className="space-y-0" data-testid="anime-details">
      {data.cover && (
        <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
          <img
            src={data.cover}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 lg:w-64 flex-shrink-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
              <img
                src={data.image}
                alt={data.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%231a1a2e'%3E%3Crect width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236366f1' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            <div className="flex flex-col gap-2 mt-3">
              {firstEpisode && (
                <Link href={`/watch/${encodeURIComponent(firstEpisode.id)}`}>
                  <Button className="w-full gap-2" data-testid="button-watch-now">
                    <Play className="h-4 w-4" />
                    Watch Now
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className={`w-full gap-2 transition-colors ${
                  inWatchlist
                    ? "border-purple-500/50 text-purple-400"
                    : ""
                }`}
                onClick={toggleWatchlist}
                data-testid="button-toggle-watchlist"
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    inWatchlist ? "fill-purple-500 text-purple-500" : ""
                  }`}
                />
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-4 min-w-0">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-title">
                {data.title}
              </h1>
              {data.otherName && (
                <p className="text-sm text-muted-foreground">{data.otherName}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {data.type && (
                <Badge variant="secondary" className="gap-1">
                  {data.type === "TV" ? <Tv className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                  {data.type}
                </Badge>
              )}
              {data.status && (
                <Badge
                  variant={data.status === "Ongoing" ? "default" : "secondary"}
                >
                  {data.status}
                </Badge>
              )}
              {data.releaseDate && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {data.releaseDate}
                </Badge>
              )}
              {data.duration && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {data.duration}
                </Badge>
              )}
              {data.rating && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  {data.rating}
                </Badge>
              )}
              {data.sub && (
                <Badge variant="secondary" className="gap-1">
                  <Subtitles className="h-3 w-3" />
                  SUB: {data.sub}
                </Badge>
              )}
              {data.dub && (
                <Badge variant="secondary" className="gap-1">
                  <Mic className="h-3 w-3" />
                  DUB: {data.dub}
                </Badge>
              )}
            </div>

            {data.genres && data.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5" data-testid="genres">
                {data.genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {description && (
              <div className="space-y-1" data-testid="text-description">
                <h3 className="text-sm font-medium">Synopsis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {data.studios && data.studios.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Studios: </span>
                <span>{data.studios.join(", ")}</span>
              </div>
            )}

            {data.season && (
              <div className="text-sm">
                <span className="text-muted-foreground">Season: </span>
                <span className="capitalize">{data.season}</span>
              </div>
            )}
          </div>
        </div>

        {data.episodes && data.episodes.length > 0 && (
          <section className="space-y-4" data-testid="episodes-list">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Episodes ({data.episodes.length})
              </h2>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2">
              {data.episodes.map((ep) => (
                <EpisodeCard
                  key={ep.id}
                  episodeId={ep.id}
                  number={ep.number}
                  title={ep.title}
                  isWatched={watchedEpisodes.has(ep.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
