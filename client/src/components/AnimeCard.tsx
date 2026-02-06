import { Link } from "wouter";
import { Play, Star, Mic, Subtitles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnimeCardProps {
  id: string;
  title: string;
  image: string;
  type?: string;
  sub?: number;
  dub?: number;
  episodes?: number;
  rating?: string;
}

export default function AnimeCard({
  id,
  title,
  image,
  type,
  sub,
  dub,
  episodes,
  rating,
}: AnimeCardProps) {
  return (
    <Link href={`/anime/${encodeURIComponent(id)}`}>
      <div
        className="group relative cursor-pointer rounded-md overflow-visible"
        data-testid={`card-anime-${id}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%231a1a2e'%3E%3Crect width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236366f1' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 backdrop-blur-sm">
              <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
            </div>
          </div>

          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {type && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-black/60 text-white border-none backdrop-blur-sm">
                {type}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center gap-1">
            {sub !== undefined && sub > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-primary/80 text-white border-none backdrop-blur-sm">
                <Subtitles className="h-3 w-3 mr-0.5" />
                {sub}
              </Badge>
            )}
            {dub !== undefined && dub > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-600/80 text-white border-none backdrop-blur-sm">
                <Mic className="h-3 w-3 mr-0.5" />
                {dub}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-2 space-y-0.5 px-0.5">
          <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {episodes !== undefined && episodes > 0 && (
            <p className="text-xs text-muted-foreground">
              {episodes} episode{episodes !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
