"use client";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
} from "lucide-react";

interface VideoSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

interface Subtitle {
  url: string;
  lang: string;
}

interface VideoPlayerProps {
  sources: VideoSource[];
  subtitles?: Subtitle[];
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
  title?: string;
}

export default function VideoPlayer({
  sources,
  subtitles = [],
  onTimeUpdate,
  initialTime = 0,
  title,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>("auto");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const bestSource = sources.reduce((best, source) => {
    const qualityOrder = ["1080p", "720p", "480p", "360p", "default", "auto", "backup"];
    const bestIdx = qualityOrder.indexOf(best.quality);
    const srcIdx = qualityOrder.indexOf(source.quality);
    return srcIdx < bestIdx || bestIdx === -1 ? source : best;
  }, sources[0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !bestSource) return;

    setIsLoading(true);
    setError(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const sourceToPlay = bestSource;

    if (sourceToPlay.isM3U8 && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });
      hlsRef.current = hls;

      hls.loadSource(sourceToPlay.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("Failed to load video. The source may be unavailable.");
          setIsLoading(false);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceToPlay.url;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
        video.play().catch(() => {});
      });
    } else if (!sourceToPlay.isM3U8) {
      video.src = sourceToPlay.url;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
        video.play().catch(() => {});
      });
    } else {
      setError("HLS playback is not supported in this browser.");
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [bestSource?.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError("An error occurred during playback.");
      setIsLoading(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [onTimeUpdate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * duration;
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  if (error) {
    return (
      <div className="aspect-video w-full rounded-md bg-card border border-border flex items-center justify-center" data-testid="video-error">
        <div className="text-center space-y-2 p-4">
          <p className="text-muted-foreground text-sm">{error}</p>
          <p className="text-xs text-muted-foreground/70">Try refreshing the page or selecting a different server.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full rounded-md overflow-hidden bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
      data-testid="video-player"
    >
      <video
        ref={videoRef}
        className="h-full w-full cursor-pointer"
        onClick={togglePlay}
        playsInline
        crossOrigin="anonymous"
      >
        {subtitles.map((sub, i) => (
          <track
            key={i}
            kind="subtitles"
            src={sub.url}
            srcLang={sub.lang}
            label={sub.lang}
            default={i === 0}
          />
        ))}
      </video>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      )}

      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {title && (
          <div className="absolute top-0 left-0 right-0 p-4">
            <p className="text-white text-sm font-medium truncate">{title}</p>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <div
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/seek"
            onClick={handleSeek}
            data-testid="seek-bar"
          >
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-primary rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity"
              style={{
                left: duration ? `${(currentTime / duration) * 100}%` : "0%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="text-white p-1 rounded-md transition-colors"
                data-testid="button-play-pause"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </button>
              <button
                onClick={toggleMute}
                className="text-white p-1 rounded-md transition-colors"
                data-testid="button-mute"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <span className="text-white text-xs font-mono" data-testid="text-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="text-white p-1 rounded-md transition-colors"
                  data-testid="button-quality"
                >
                  <Settings className="h-5 w-5" />
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-md p-1 min-w-[100px]">
                    {sources.map((source) => (
                      <button
                        key={source.quality}
                        onClick={() => {
                          setSelectedQuality(source.quality);
                          setShowQualityMenu(false);
                        }}
                        className={`block w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                          selectedQuality === source.quality
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground"
                        }`}
                        data-testid={`quality-${source.quality}`}
                      >
                        {source.quality}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={toggleFullscreen}
                className="text-white p-1 rounded-md transition-colors"
                data-testid="button-fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
