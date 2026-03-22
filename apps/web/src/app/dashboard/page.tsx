"use client";

import { ConnectSpotifyBanner } from "@/components/dashboard/connect-spotify-banner";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TopTracks } from "@/components/dashboard/top-tracks";
import { RecentArtists } from "@/components/dashboard/recent-artists";
import { RecentlyPlayed } from "@/components/dashboard/recently-played";
import { RecommendationPlayer } from "@/components/dashboard/recommendation-player";
import { useUser } from "@clerk/nextjs";
import { Search, Bell, Sparkles } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-56 pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Generate CTA */}
          <a
            href="/dashboard/generate"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Create
          </a>

          {/* User avatar */}
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-border">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-emerald-600/20 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-500">
                  {user?.firstName?.[0] ?? "U"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connect Spotify banner */}
      <ConnectSpotifyBanner />

      {/* Main grid layout - inspired by Dribbble design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview stats */}
          <StatsCards />

          {/* Recent artists row */}
          <RecentArtists />

          {/* Top tracks */}
          <TopTracks />
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Recently played */}
          <RecentlyPlayed />

          {/* AI Recommendation player */}
          <RecommendationPlayer />
        </div>
      </div>
    </div>
  );
}
