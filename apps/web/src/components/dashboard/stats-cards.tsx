"use client";

import { trpc } from "@/lib/trpc";
import { Music, Disc3, Radio, Headphones, TrendingUp } from "lucide-react";

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
      label: "Liked Songs",
      value: savedTracks?.total ?? "—",
      icon: Headphones,
      trend: null,
      trendLabel: "total",
    },
    {
      label: "Playlists",
      value: playlists?.total ?? "—",
      icon: Radio,
      trend: null,
      trendLabel: "total",
    },
    {
      label: "Top Tracks",
      value: topTracks?.total ?? "—",
      icon: Music,
      trend: null,
      trendLabel: "analyzed",
    },
    {
      label: "Top Artists",
      value: topArtists?.total ?? "—",
      icon: Disc3,
      trend: null,
      trendLabel: "discovered",
    },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-foreground">Overview</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground tracking-tight">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </span>
                {stat.trend && (
                  <span className="flex items-center gap-0.5 text-xs text-emerald-500 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground/60">
                {stat.trendLabel}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
