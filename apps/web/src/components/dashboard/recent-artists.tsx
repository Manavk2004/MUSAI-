"use client";

import { trpc } from "@/lib/trpc";
import Image from "next/image";

export function RecentArtists() {
  const { data: topArtists, isLoading } = trpc.spotify.getTopArtists.useQuery({
    timeRange: "short_term",
    limit: 6,
  });

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">
          Top Artists
        </h2>
        <a
          href="/dashboard/taste"
          className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
        >
          View all
        </a>
      </div>

      {isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary animate-pulse" />
              <div className="w-10 h-3 bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-1">
          {topArtists?.items?.slice(0, 6).map((artist: any) => (
            <a
              key={artist.id}
              href={artist.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group flex-shrink-0"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-500 transition-all">
                {artist.images?.[0]?.url ? (
                  <Image
                    src={artist.images[0].url}
                    alt={artist.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[56px] text-center">
                {artist.name}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
