import { Link } from "wouter";
import { Play, Check } from "lucide-react";

interface EpisodeCardProps {
  episodeId: string;
  number: number;
  title?: string;
  isCurrent?: boolean;
  isWatched?: boolean;
}

export default function EpisodeCard({
  episodeId,
  number,
  title,
  isCurrent = false,
  isWatched = false,
}: EpisodeCardProps) {
  return (
    <Link href={`/watch/${encodeURIComponent(episodeId)}`}>
      <div
        className={`group relative flex items-center justify-center rounded-md border cursor-pointer transition-colors ${
          isCurrent
            ? "bg-primary text-primary-foreground border-primary"
            : isWatched
            ? "bg-muted/80 border-border text-muted-foreground"
            : "bg-card border-border hover-elevate"
        }`}
        data-testid={`episode-${number}`}
      >
        <div className="flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
          {isCurrent ? (
            <Play className="h-3 w-3 flex-shrink-0" />
          ) : isWatched ? (
            <Check className="h-3 w-3 flex-shrink-0" />
          ) : null}
          <span className="text-sm font-medium">{number}</span>
        </div>
      </div>
    </Link>
  );
}
