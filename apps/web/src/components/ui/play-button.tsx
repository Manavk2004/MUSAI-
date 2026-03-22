"use client";

import { Play, Pause } from "lucide-react";
import { usePlayerOptional } from "@/providers/spotify-player-provider";
import { cn } from "@/lib/utils";

interface PlayButtonProps {
  trackUri: string;
  trackUris?: string[];
  offset?: number;
  size?: "sm" | "md";
  className?: string;
}

export function PlayButton({
  trackUri,
  trackUris,
  offset = 0,
  size = "sm",
  className,
}: PlayButtonProps) {
  const player = usePlayerOptional();

  if (!player?.isReady) return null;

  const isCurrentTrack = player.currentTrack?.uri === trackUri;
  const isPlayingThis = isCurrentTrack && player.isPlaying;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isPlayingThis) {
        player.pause();
      } else if (isCurrentTrack) {
        player.resume();
      } else {
        await player.play(trackUris || [trackUri], trackUris ? offset : 0);
      }
    } catch {
      // Silently handle errors (e.g. missing permissions)
      console.error("Playback failed — check Spotify permissions/scopes");
    }
  };

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 hover:scale-110 transition-all text-black shadow-lg",
        size === "sm" ? "w-6 h-6" : "w-8 h-8",
        className
      )}
    >
      {isPlayingThis ? (
        <Pause className={iconSize} fill="currentColor" />
      ) : (
        <Play className={cn(iconSize, "ml-0.5")} fill="currentColor" />
      )}
    </button>
  );
}
