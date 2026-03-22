"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Music,
  Zap,
  Brain,
  PartyPopper,
  CloudRain,
  Heart,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export function PlaylistDialog({ open, onClose, onGenerated }: PlaylistDialogProps) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [adventurousness, setAdventurousness] = useState(50);
  const [songCount, setSongCount] = useState<string>("20");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const generateMutation = trpc.playlist.generate.useMutation({
    onSuccess: (data) => {
      onGenerated(data);
      resetForm();
    },
  });

  const resetForm = () => {
    setStep(0);
    setMood("");
    setGenre("");
    setAdventurousness(50);
    setSongCount("20");
    setAdditionalNotes("");
  };

  const handleGenerate = () => {
    generateMutation.mutate({
      mood: mood as any,
      genre: genre || undefined,
      adventurousness,
      songCount: songCount as any,
      additionalNotes: additionalNotes || undefined,
    });
  };

  const canProceed = () => {
    if (step === 0) return !!mood;
    return true;
  };

  if (!open) return null;

  const steps = [
    // Step 0: Mood
    <div key="mood" className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          What&apos;s the vibe?
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose the mood for your playlist
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {moods.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                mood === m.value
                  ? "border-emerald-500 bg-emerald-600/10"
                  : "border-border hover:border-emerald-800/50 bg-card"
              )}
            >
              <Icon className={cn("w-5 h-5", m.color)} />
              <span className="text-sm font-medium text-foreground">
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>,

    // Step 1: Genre
    <div key="genre" className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Any genre preference?
        </h3>
        <p className="text-sm text-muted-foreground">
          Pick a genre or leave blank for &quot;surprise me&quot;
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setGenre("")}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm border transition-all",
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
              "px-3 py-1.5 rounded-full text-sm border transition-all",
              genre === g
                ? "border-emerald-500 bg-emerald-600/10 text-emerald-500"
                : "border-border text-muted-foreground hover:border-emerald-800/50"
            )}
          >
            {g}
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Adventurousness
    <div key="adventure" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          How adventurous?
        </h3>
        <p className="text-sm text-muted-foreground">
          Stick close to your taste or explore new territory
        </p>
      </div>
      <div className="space-y-4">
        <input
          type="range"
          min={0}
          max={100}
          value={adventurousness}
          onChange={(e) => setAdventurousness(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Familiar</span>
          <span className="text-emerald-500 font-medium">
            {adventurousness}%
          </span>
          <span>Exploratory</span>
        </div>
      </div>
    </div>,

    // Step 3: Song count + notes
    <div key="details" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Final details
        </h3>
        <p className="text-sm text-muted-foreground">
          How many songs and any special requests?
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Number of songs
        </label>
        <div className="flex gap-2">
          {songCounts.map((count) => (
            <button
              key={count}
              onClick={() => setSongCount(count)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium border transition-all",
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
        <label className="text-sm font-medium text-foreground mb-2 block">
          Additional notes (optional)
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="e.g., 'Songs great for a road trip' or 'Nothing too mainstream'"
          className="w-full h-20 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>,
  ];

  const isLastStep = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-foreground">
              Generate Playlist
            </span>
          </div>
          <button
            onClick={() => { onClose(); resetForm(); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-emerald-500" : "bg-secondary"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">{steps[step]}</div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={cn(
              "flex items-center gap-1 text-sm transition-colors",
              step === 0
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !canProceed()}
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
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
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
