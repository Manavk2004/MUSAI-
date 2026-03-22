"use client";

import { trpc } from "@/lib/trpc";
import { Music, Disc3, Radio, Headphones } from "lucide-react";

export function StatsCards() {
  const { data: topTracks } = trpc.spotify.getTopTracks.useQuery({
    timeRange: "medium_term",
    limit: 50,
  });
  const { data: topArtists } = trpc.spotify.getTopArtists.useQuery({
    timeRange: "medium_term",
    limit: 50,
  });
  const { data: playlists } = trpc.spotify.getPlaylists.useQuery({
    limit: 1,
    offset: 0,
  });
  const { data: savedTracks } = trpc.spotify.getSavedTracks.useQuery({
    limit: 1,
    offset: 0,
  });

  const stats = [
    {
      label: "Top Tracks",
      value: topTracks?.items?.length ?? "—",
      icon: Music,
      color: "text-emerald-500",
      bg: "bg-emerald-600/10",
    },
    {
      label: "Top Artists",
      value: topArtists?.items?.length ?? "—",
      icon: Disc3,
      color: "text-emerald-400",
      bg: "bg-emerald-600/10",
    },
    {
      label: "Playlists",
      value: playlists?.total ?? "—",
      icon: Radio,
      color: "text-emerald-300",
      bg: "bg-emerald-600/10",
    },
    {
      label: "Liked Songs",
      value: savedTracks?.total ?? "—",
      icon: Headphones,
      color: "text-emerald-200",
      bg: "bg-emerald-600/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
