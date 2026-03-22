"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import { Play, Pause, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecommendationPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: profile } = trpc.user.getProfile.useQuery();
  const { data: topTracks } = trpc.spotify.getTopTracks.useQuery({
    timeRange: "medium_term",
    limit: 5,
  });

  // For now, use the first top track's preview as the recommendation
  // In production, this would come from the AI daily recommendation
  const recommendation = topTracks?.items?.[0];
  const previewUrl = recommendation?.preview_url;
  const isPremium = profile?.spotifyProfile?.product === "premium";

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      audioRef.current.play();
      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setProgress(
            (audioRef.current.currentTime / audioRef.current.duration) * 100
          );
        }
      }, 100);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  if (!recommendation) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          AI Recommendation
        </h3>
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">
            Connect Spotify to get your daily pick
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 emerald-glow">
      <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-4">
        AI Pick for You
      </h3>

      <div className="flex items-start gap-4">
        {/* Album art */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 group">
          {recommendation.album?.images?.[0]?.url ? (
            <Image
              src={recommendation.album.images[0].url}
              alt={recommendation.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-secondary" />
          )}
          <button
            onClick={togglePlay}
            disabled={!previewUrl}
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
              previewUrl
                ? "opacity-0 group-hover:opacity-100"
                : "opacity-0"
            )}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {recommendation.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {recommendation.artists?.map((a: any) => a.name).join(", ")}
          </p>
          <p className="text-xs text-muted-foreground/60 truncate">
            {recommendation.album?.name}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {previewUrl && (
        <div className="mt-4">
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <button
              onClick={togglePlay}
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </button>

              <a
                href={recommendation.external_urls?.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-emerald-500 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Premium nudge */}
      {!isPremium && previewUrl && (
        <p className="text-[10px] text-muted-foreground/50 mt-2">
          30s preview &middot;{" "}
          <a
            href="https://www.spotify.com/premium/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline"
          >
            Upgrade to Premium
          </a>{" "}
          for full tracks
        </p>
      )}

      {!previewUrl && (
        <div className="mt-3">
          <a
            href={recommendation.external_urls?.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Listen on Spotify
          </a>
        </div>
      )}

      {previewUrl && (
        <audio
          ref={audioRef}
          src={previewUrl}
          onEnded={handleEnded}
          preload="none"
        />
      )}
    </div>
  );
}
