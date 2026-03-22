"use client";

import { useState } from "react";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import {
  X,
  Sparkles,
  Loader2,
  Music,
  Zap,
  Brain,
  PartyPopper,
  CloudRain,
  Heart,
  Dumbbell,
  Music2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SongBrowser } from "./song-browser";

interface PlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (result: any) => void;
}

const moods = [
  { value: "chill", label: "Chill", icon: CloudRain, color: "text-blue-400" },
  { value: "energetic", label: "Energetic", icon: Zap, color: "text-yellow-400" },
  { value: "focused", label: "Focused", icon: Brain, color: "text-purple-400" },
  { value: "party", label: "Party", icon: PartyPopper, color: "text-pink-400" },
  { value: "melancholy", label: "Melancholy", icon: CloudRain, color: "text-slate-400" },
  { value: "romantic", label: "Romantic", icon: Heart, color: "text-red-400" },
  { value: "workout", label: "Workout", icon: Dumbbell, color: "text-orange-400" },
] as const;

const songCounts = ["10", "20", "30", "50"] as const;

const genres = [
  "Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz", "Classical",
  "Country", "Latin", "Indie", "Metal", "Folk", "Reggae", "Blues",
  "K-Pop", "Afrobeats", "Lo-fi", "Ambient",
];

type Tab = "vibe" | "songs";

interface SelectedTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
}

export function PlaylistDialog({ open, onClose, onGenerated }: PlaylistDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>("vibe");

  // Vibe tab state
  const [mood, setMood] = useState<
    "" | "chill" | "energetic" | "focused" | "party" | "melancholy" | "romantic" | "workout"
  >("");
  const [genre, setGenre] = useState<string>("");

  // Songs tab state
  const [selectedTracks, setSelectedTracks] = useState<SelectedTrack[]>([]);

  // Shared state
  const [songCount, setSongCount] = useState<"10" | "20" | "30" | "50">("20");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const generateMutation = trpc.playlist.generate.useMutation({
    onSuccess: (data) => {
      onGenerated(data);
      resetForm();
    },
  });

  const resetForm = () => {
    setMood("");
    setGenre("");
    setSelectedTracks([]);
    setSongCount("20");
    setAdditionalNotes("");
  };

  const handleGenerate = () => {
    if (activeTab === "vibe") {
      generateMutation.mutate({
        mood: mood || undefined,
        genre: genre || undefined,
        songCount,
        additionalNotes: additionalNotes || undefined,
      });
    } else {
      generateMutation.mutate({
        seedTracks: selectedTracks.map((t) => ({
          name: t.name,
          artist: t.artist,
        })),
        songCount,
        additionalNotes: additionalNotes || undefined,
      });
    }
  };

  const canGenerate =
    activeTab === "vibe" ? !!mood : selectedTracks.length > 0;

  const handleToggleTrack = (track: SelectedTrack) => {
    setSelectedTracks((prev) => {
      const exists = prev.find((t) => t.id === track.id);
      if (exists) {
        return prev.filter((t) => t.id !== track.id);
      }
      return [...prev, track];
    });
  };

  const handleRemoveTrack = (id: string) => {
    setSelectedTracks((prev) => prev.filter((t) => t.id !== id));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-foreground">
              Generate Playlist
            </span>
          </div>
          <button
            onClick={() => { onClose(); resetForm(); }}
            aria-label="Close dialog"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("vibe")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center",
                activeTab === "vibe"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-4 h-4" />
              By Vibe
            </button>
            <button
              onClick={() => setActiveTab("songs")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center",
                activeTab === "songs"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Music2 className="w-4 h-4" />
              By Songs
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
          {activeTab === "vibe" ? (
            <div className="space-y-5">
              {/* Mood selection */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  What&apos;s the vibe?
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose the mood for your playlist
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {moods.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.value}
                        onClick={() => setMood(m.value)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                          mood === m.value
                            ? "border-emerald-500 bg-emerald-600/10"
                            : "border-border hover:border-emerald-800/50 bg-card"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", m.color)} />
                        <span className="text-sm font-medium text-foreground">
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Genre selection */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Genre preference
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Optional — leave blank for surprise
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setGenre("")}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs border transition-all",
                      !genre
                        ? "border-emerald-500 bg-emerald-600/10 text-emerald-500"
                        : "border-border text-muted-foreground hover:border-emerald-800/50"
                    )}
                  >
                    Surprise Me
                  </button>
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenre(g)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs border transition-all",
                        genre === g
                          ? "border-emerald-500 bg-emerald-600/10 text-emerald-500"
                          : "border-border text-muted-foreground hover:border-emerald-800/50"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Song browser */}
              <SongBrowser
                selectedTrackIds={selectedTracks.map((t) => t.id)}
                onToggleTrack={handleToggleTrack}
                maxTracks={10}
              />

              {/* Selected tracks bar */}
              {selectedTracks.length > 0 && (
                <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {selectedTracks.length} song{selectedTracks.length !== 1 ? "s" : ""} selected
                    </span>
                    <button
                      onClick={() => setSelectedTracks([])}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedTracks.map((track) => (
                      <div
                        key={track.id}
                        className="relative group flex-shrink-0"
                      >
                        <div className="w-10 h-10 rounded overflow-hidden">
                          {track.image ? (
                            <Image
                              src={track.image}
                              alt={track.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                              <Music className="w-3 h-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveTrack(track.id)}
                          aria-label={`Remove ${track.name}`}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shared: Song count + Notes */}
          <div className="mt-5 space-y-4 border-t border-border pt-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-2 block">
                Number of songs
              </label>
              <div className="flex gap-2">
                {songCounts.map((count) => (
                  <button
                    key={count}
                    onClick={() => setSongCount(count)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all",
                      songCount === count
                        ? "border-emerald-500 bg-emerald-600/10 text-emerald-500"
                        : "border-border text-muted-foreground hover:border-emerald-800/50"
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-2 block">
                Any extra direction? (optional)
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={
                  activeTab === "vibe"
                    ? "e.g., 'Songs great for a road trip' or 'Nothing too mainstream'"
                    : "e.g., 'More upbeat versions' or 'Surprise me with new artists'"
                }
                className="w-full h-16 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0">
          <div className="text-xs text-muted-foreground">
            {activeTab === "songs" && selectedTracks.length > 0 && (
              <span>
                Generating based on {selectedTracks.length} seed song{selectedTracks.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !canGenerate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {generateMutation.error && (
          <div className="px-6 pb-4">
            <p className="text-sm text-red-400">
              {generateMutation.error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
