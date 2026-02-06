"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import VideoPlayer from "@/components/VideoPlayer";
import EpisodeCard from "@/components/EpisodeCard";
import { VideoPlayerSkeleton } from "@/components/LoadingSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Tv,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

interface VideoSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

interface Subtitle {
  url: string;
  lang: string;
}

interface WatchData {
  sources: VideoSource[];
  subtitles?: Subtitle[];
  headers?: Record<string, string>;
}

interface Episode {
  id: string;
  number: number;
  title?: string;
}

interface AnimeInfo {
  id: string;
  title: string;
  image: string;
  episodes: Episode[];
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

export default function WatchPage() {
  const params = useParams<{ episodeId: string }>();
  const episodeId = params.episodeId ? decodeURIComponent(params.episodeId) : "";
  const [, setLocation] = useLocation();
  const [savedTime, setSavedTime] = useState(0);

  const animeId = episodeId.split("$episode$")[0] || episodeId.split("?ep=")[0] || "";

  const { data: watchData, isLoading: watchLoading, error: watchError } = useQuery<WatchData>({
    queryKey: ["/api/anime/watch", episodeId],
    enabled: !!episodeId,
  });

  const { data: animeInfo, isLoading: infoLoading } = useQuery<AnimeInfo>({
    queryKey: ["/api/anime/info", animeId],
    enabled: !!animeId,
  });

  const episodes = animeInfo?.episodes || [];
  const currentEpisodeIndex = episodes.findIndex((ep) => ep.id === episodeId);
  const currentEpisode = currentEpisodeIndex >= 0 ? episodes[currentEpisodeIndex] : null;
  const prevEpisode = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
  const nextEpisode =
    currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1
      ? episodes[currentEpisodeIndex + 1]
      : null;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("continueWatching");
      if (saved) {
        const items: ContinueWatching[] = JSON.parse(saved);
        const found = items.find((i) => i.episodeId === episodeId);
        if (found) {
          setSavedTime(found.currentTime);
        } else {
          setSavedTime(0);
        }
      }
    } catch {}
  }, [episodeId]);

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      if (!animeInfo || !currentEpisode || duration < 1) return;

      try {
        const saved = localStorage.getItem("continueWatching");
        let items: ContinueWatching[] = saved ? JSON.parse(saved) : [];

        const existing = items.findIndex((i) => i.episodeId === episodeId);
        const entry: ContinueWatching = {
          animeId: animeInfo.id,
          animeTitle: animeInfo.title,
          animeImage: animeInfo.image,
          episodeId,
          episodeNumber: currentEpisode.number,
          currentTime,
          duration,
          timestamp: Date.now(),
        };

        if (existing >= 0) {
          items[existing] = entry;
        } else {
          items.unshift(entry);
        }

        items = items.slice(0, 20);
        localStorage.setItem("continueWatching", JSON.stringify(items));
      } catch {}
    },
    [animeInfo, currentEpisode, episodeId]
  );

  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("continueWatching");
      if (saved) {
        const items = JSON.parse(saved) as ContinueWatching[];
        setWatchedEpisodes(new Set(items.map((i) => i.episodeId)));
      }
    } catch {}
  }, [episodeId]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-6" data-testid="watch-page">
      <div className="flex items-center gap-2 flex-wrap">
        {animeInfo && (
          <Link href={`/anime/${encodeURIComponent(animeInfo.id)}`}>
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" data-testid="button-back-to-anime">
              <ArrowLeft className="h-4 w-4" />
              {animeInfo.title}
            </Button>
          </Link>
        )}
        {!animeInfo && !infoLoading && (
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          {watchLoading && <VideoPlayerSkeleton />}

          {watchError && (
            <div className="aspect-video w-full rounded-md bg-card border border-border flex items-center justify-center" data-testid="watch-error">
              <div className="text-center space-y-3 p-4">
                <AlertCircle className="h-10 w-10 text-destructive/60 mx-auto" />
                <p className="text-muted-foreground text-sm">
                  Failed to load video sources.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  The episode may not be available. Try a different server or episode.
                </p>
              </div>
            </div>
          )}

          {watchData && watchData.sources && watchData.sources.length > 0 && (
            <VideoPlayer
              sources={watchData.sources}
              subtitles={watchData.subtitles}
              onTimeUpdate={handleTimeUpdate}
              initialTime={savedTime}
              title={
                animeInfo
                  ? `${animeInfo.title} - Episode ${currentEpisode?.number || ""}`
                  : undefined
              }
            />
          )}

          <div className="space-y-2">
            {animeInfo && currentEpisode && (
              <div>
                <h1 className="text-lg font-semibold" data-testid="text-episode-title">
                  {animeInfo.title}
                </h1>
                <p className="text-sm text-muted-foreground" data-testid="text-episode-number">
                  Episode {currentEpisode.number}
                  {currentEpisode.title ? ` - ${currentEpisode.title}` : ""}
                </p>
              </div>
            )}
            {infoLoading && (
              <div className="space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {prevEpisode && (
              <Link href={`/watch/${encodeURIComponent(prevEpisode.id)}`}>
                <Button variant="outline" size="sm" className="gap-1" data-testid="button-prev-episode">
                  <ChevronLeft className="h-4 w-4" />
                  Prev Episode
                </Button>
              </Link>
            )}
            {nextEpisode && (
              <Link href={`/watch/${encodeURIComponent(nextEpisode.id)}`}>
                <Button variant="outline" size="sm" className="gap-1" data-testid="button-next-episode">
                  Next Episode
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">
              Episodes {episodes.length > 0 ? `(${episodes.length})` : ""}
            </h3>
          </div>
          {infoLoading && (
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-md" />
              ))}
            </div>
          )}
          {episodes.length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
              <div className="grid grid-cols-5 gap-2">
                {episodes.map((ep) => (
                  <EpisodeCard
                    key={ep.id}
                    episodeId={ep.id}
                    number={ep.number}
                    title={ep.title}
                    isCurrent={ep.id === episodeId}
                    isWatched={watchedEpisodes.has(ep.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
