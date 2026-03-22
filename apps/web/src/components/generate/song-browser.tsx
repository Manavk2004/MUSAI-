"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import { Search, Check, Clock, TrendingUp, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
}

interface SongBrowserProps {
  selectedTrackIds: string[];
  onToggleTrack: (track: Track) => void;
  maxTracks?: number;
}

type SubTab = "recent" | "top" | "liked" | "search";
type TimeRange = "short_term" | "medium_term" | "long_term";

const subTabs = [
  { value: "recent" as SubTab, label: "Recent", icon: Clock },
  { value: "top" as SubTab, label: "Top Songs", icon: TrendingUp },
  { value: "liked" as SubTab, label: "Liked", icon: Heart },
  { value: "search" as SubTab, label: "Search", icon: Search },
] as const;

const timeRangeLabels = {
  short_term: "Last Month",
  medium_term: "6 Months",
  long_term: "All Time",
} as const;

function normalizeTrack(item: any): Track | null {
  const track = item.track || item;
  if (!track || !track.id || !track.name) return null;
  return {
    id: track.id,
    name: track.name,
    artist: track.artists?.[0]?.name || "Unknown",
    album: track.album?.name || "",
    image: track.album?.images?.[0]?.url || "",
  };
}

function TrackRow({
  track,
  isSelected,
  onToggle,
  disabled,
}: {
  track: Track;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled && !isSelected}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-left",
        isSelected
          ? "bg-emerald-600/10 border border-emerald-500/30"
          : "hover:bg-secondary/50 border border-transparent",
        disabled && !isSelected && "opacity-40 cursor-not-allowed"
      )}
    >
      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
        {track.image ? (
          <Image
            src={track.image}
            alt={track.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isSelected ? "text-emerald-500" : "text-foreground"
        )}>
          {track.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {track.artist} &middot; {track.album}
        </p>
      </div>

      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
          isSelected
            ? "border-emerald-500 bg-emerald-500"
            : "border-muted-foreground/30"
        )}
      >
        {isSelected && <Check className="w-3 h-3 text-black" />}
      </div>
    </button>
  );
}

export function SongBrowser({
  selectedTrackIds,
  onToggleTrack,
  maxTracks = 10,
}: SongBrowserProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const recentlyPlayed = trpc.spotify.getRecentlyPlayed.useQuery(
    { limit: 50 },
    { enabled: activeSubTab === "recent" }
  );

  const topTracks = trpc.spotify.getTopTracks.useQuery(
    { timeRange, limit: 50 },
    { enabled: activeSubTab === "top" }
  );

  const savedTracks = trpc.spotify.getSavedTracks.useQuery(
    { limit: 50 },
    { enabled: activeSubTab === "liked" }
  );

  const searchResults = trpc.spotify.searchTracks.useQuery(
    { query: debouncedQuery, limit: 20 },
    { enabled: activeSubTab === "search" && debouncedQuery.length > 0 }
  );

  const atMax = selectedTrackIds.length >= maxTracks;

  const isLoading =
    (activeSubTab === "recent" && recentlyPlayed.isLoading) ||
    (activeSubTab === "top" && topTracks.isLoading) ||
    (activeSubTab === "liked" && savedTracks.isLoading) ||
    (activeSubTab === "search" && searchResults.isLoading);

  const isError =
    (activeSubTab === "recent" && recentlyPlayed.isError) ||
    (activeSubTab === "top" && topTracks.isError) ||
    (activeSubTab === "liked" && savedTracks.isError) ||
    (activeSubTab === "search" && searchResults.isError);

  const selectedIdSet = useMemo(() => new Set(selectedTrackIds), [selectedTrackIds]);

  const tracks = useMemo((): Track[] => {
    const filterValid = (items: any[]): Track[] =>
      items.map(normalizeTrack).filter((t): t is Track => t !== null);

    switch (activeSubTab) {
      case "recent": {
        const items = recentlyPlayed.data?.items || [];
        const seen = new Set<string>();
        return filterValid(items).filter((t) => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });
      }
      case "top":
        return filterValid(topTracks.data?.items || []);
      case "liked":
        return filterValid(savedTracks.data?.items || []);
      case "search":
        return filterValid(searchResults.data?.tracks?.items || []);
      default:
        return [];
    }
  }, [activeSubTab, recentlyPlayed.data, topTracks.data, savedTracks.data, searchResults.data]);

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveSubTab(tab.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 justify-center",
                activeSubTab === tab.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Time range filter for Top Songs */}
      {activeSubTab === "top" && (
        <div className="flex gap-1.5">
          {(Object.entries(timeRangeLabels) as [TimeRange, string][]).map(
            ([value, label]) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs transition-all",
                  timeRange === value
                    ? "bg-emerald-600/10 text-emerald-500 border border-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                )}
              >
                {label}
              </button>
            )
          )}
        </div>
      )}

      {/* Search input */}
      {activeSubTab === "search" && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a song..."
            className="w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
            autoFocus
          />
        </div>
      )}

      {/* Track list */}
      <div className="max-h-[280px] overflow-y-auto space-y-1 pr-1">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && isError && (
          <div className="text-center py-8 text-sm text-red-400">
            Failed to load tracks. Please try again.
          </div>
        )}

        {!isLoading && !isError && tracks.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {activeSubTab === "search" && !debouncedQuery
              ? "Type to search for songs"
              : "No tracks found"}
          </div>
        )}

        {!isLoading && !isError &&
          tracks.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              isSelected={selectedIdSet.has(track.id)}
              onToggle={() => onToggleTrack(track)}
              disabled={atMax}
            />
          ))}
      </div>
    </div>
  );
}
