"use client";

import { usePlayerOptional } from "@/providers/spotify-player-provider";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function formatTime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const player = usePlayerOptional();
  const [isDragging, setIsDragging] = useState(false);

  // Don't render if no player context, not ready, or no track playing
  if (!player || !player.isReady || !player.currentTrack) {
    return null;
  }

  const { currentTrack, isPlaying, position, duration, volume } = player;
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    player.seek(Math.floor(percent * duration));
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    player.setVolume(Math.max(0, Math.min(1, percent)));
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-0 left-64 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      {/* Progress bar (thin, at top of player bar) */}
      <div
        className="h-1 w-full cursor-pointer group"
        onClick={handleProgressClick}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div className="h-full bg-secondary relative">
          <div
            className="h-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md transition-opacity",
                isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center h-16 px-4 gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 w-72 min-w-0">
          {currentTrack.image && (
            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
              <Image
                src={currentTrack.image}
                alt={currentTrack.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentTrack.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.artists}
            </p>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button
              onClick={player.skipPrevious}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={isPlaying ? player.pause : player.resume}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-black" />
              ) : (
                <Play className="w-4 h-4 text-black ml-0.5" />
              )}
            </button>
            <button
              onClick={player.skipNext}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{formatTime(position)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-36">
          <button
            onClick={() => player.setVolume(volume === 0 ? 0.5 : 0)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <VolumeIcon className="w-4 h-4" />
          </button>
          <div
            className="flex-1 h-1 bg-secondary rounded-full cursor-pointer group"
            onClick={handleVolumeClick}
          >
            <div
              className="h-full bg-foreground/60 group-hover:bg-emerald-500 rounded-full relative transition-colors"
              style={{ width: `${volume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
