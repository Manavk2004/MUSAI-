"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { TopTracks } from "@/components/dashboard/top-tracks";
import { RecommendationPlayer } from "@/components/dashboard/recommendation-player";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your music at a glance
        </p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top tracks - takes 2 columns */}
        <div className="lg:col-span-2">
          <TopTracks />
        </div>

        {/* AI Recommendation player - bottom left on large screens */}
        <div className="lg:col-span-1">
          <RecommendationPlayer />
        </div>
      </div>
    </div>
  );
}
