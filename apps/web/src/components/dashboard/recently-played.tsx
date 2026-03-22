"use client";

import { trpc } from "@/lib/trpc";
import Image from "next/image";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PlayButton } from "@/components/ui/play-button";
import { usePlayerOptional } from "@/providers/spotify-player-provider";

export function RecentlyPlayed() {
  const { data, isLoading } = trpc.spotify.getRecentlyPlayed.useQuery({
    limit: 8,
  });

  const player = usePlayerOptional();
  const allUris =
    data?.items?.map((item: any) => item.track.uri) || [];

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">
          Recently Played
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-secondary" />
              <div className="flex-1">
                <div className="h-3.5 bg-secondary rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !data?.items?.length ? (
        <p className="text-sm text-muted-foreground py-4">
          No recent listening history
        </p>
      ) : (
        <div className="space-y-1">
          {data.items.map((item: any, index: number) => {
            const track = item.track;
            const isCurrentTrack =
              player?.currentTrack?.uri === track.uri;

            return (
              <div
                key={`${track.id}-${index}`}
                className={cn(
                  "flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-secondary/40 transition-colors group",
                  isCurrentTrack && "bg-emerald-500/5"
                )}
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
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
                  {player?.isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayButton
                        trackUri={track.uri}
                        trackUris={allUris}
                        offset={index}
                        size="sm"
                      />
                    </div>
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
                <span className="text-[11px] text-muted-foreground/60 flex-shrink-0">
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
