"use client";

import { useState } from "react";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import { cn, formatDuration } from "@/lib/utils";
import { PlayButton } from "@/components/ui/play-button";
import { usePlayerOptional } from "@/providers/spotify-player-provider";

const timeRanges = [
  { value: "short_term" as const, label: "4 Weeks" },
  { value: "medium_term" as const, label: "6 Months" },
  { value: "long_term" as const, label: "All Time" },
];

export function TopTracks() {
  const [timeRange, setTimeRange] = useState<
    "short_term" | "medium_term" | "long_term"
  >("medium_term");

  const { data, isLoading, error } = trpc.spotify.getTopTracks.useQuery({
    timeRange,
    limit: 10,
  });

  const player = usePlayerOptional();
  const allUris = data?.items?.map((t: any) => t.uri) || [];

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Top Tracks
        </h2>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                timeRange === range.value
                  ? "bg-emerald-600/20 text-emerald-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 animate-pulse"
            >
              <div className="w-8 text-center text-muted-foreground text-sm">
                {i + 1}
              </div>
              <div className="w-10 h-10 rounded bg-secondary" />
              <div className="flex-1">
                <div className="h-4 bg-secondary rounded w-3/4 mb-1" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            Connect your Spotify account to see your top tracks
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.items?.map((track: any, index: number) => {
            const isCurrentTrack =
              player?.currentTrack?.uri === track.uri;

            return (
              <div
                key={track.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group",
                  isCurrentTrack && "bg-emerald-500/5"
                )}
              >
                <div className="w-6 text-center relative">
                  <span
                    className={cn(
                      "text-muted-foreground text-sm font-medium",
                      player?.isReady && "group-hover:invisible"
                    )}
                  >
                    {index + 1}
                  </span>
                  {player?.isReady && (
                    <div className="absolute inset-0 flex items-center justify-center invisible group-hover:visible">
                      <PlayButton
                        trackUri={track.uri}
                        trackUris={allUris}
                        offset={index}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
                <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  {track.album?.images?.[0]?.url ? (
                    <Image
                      src={track.album.images[0].url}
                      alt={track.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate transition-colors",
                      isCurrentTrack
                        ? "text-emerald-500"
                        : "text-foreground group-hover:text-emerald-500"
                    )}
                  >
                    {track.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artists?.map((a: any) => a.name).join(", ")}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDuration(track.duration_ms)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
