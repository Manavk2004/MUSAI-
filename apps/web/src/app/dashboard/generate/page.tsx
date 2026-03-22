"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { PlaylistDialog } from "@/components/generate/playlist-dialog";
import { GeneratedPlaylist } from "@/components/generate/generated-playlist";

const PLAYLIST_STORAGE_KEY = "musai_pending_playlist";

export default function GeneratePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<any>(null);

  // Restore playlist from sessionStorage after Spotify auth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("spotify_authorized") === "true") {
      const stored = sessionStorage.getItem(PLAYLIST_STORAGE_KEY);
      if (stored) {
        try {
          setGeneratedPlaylist(JSON.parse(stored));
        } catch { /* ignore parse errors */ }
      }
      // Clean up the URL param
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Generate Playlist
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Let AI create the perfect playlist based on your taste
        </p>
      </div>

      {/* Generate button */}
      {!generatedPlaylist && (
        <div className="flex items-center justify-center py-20">
          <button
            onClick={() => setDialogOpen(true)}
            className="group relative flex flex-col items-center gap-4"
          >
            <div className="w-24 h-24 rounded-2xl bg-emerald-600 flex items-center justify-center transition-all group-hover:scale-105 animate-pulse-glow">
              <Sparkles className="w-10 h-10 text-black" />
            </div>
            <span className="text-foreground font-semibold">
              Generate New Playlist
            </span>
            <span className="text-muted-foreground text-sm">
              Click to customize and generate
            </span>
          </button>
        </div>
      )}

      {/* Generated playlist */}
      {generatedPlaylist && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Your Generated Playlist
            </h2>
            <button
              onClick={() => {
                setGeneratedPlaylist(null);
                setDialogOpen(true);
              }}
              className="flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate Another
            </button>
          </div>
          <GeneratedPlaylist
            tracks={generatedPlaylist.tracks}
            mood={generatedPlaylist.mood}
            genre={generatedPlaylist.genre}
            songCount={generatedPlaylist.songCount}
          />
        </div>
      )}

      {/* Dialog */}
      <PlaylistDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onGenerated={(result) => {
          setDialogOpen(false);
          setGeneratedPlaylist(result);
          sessionStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(result));
        }}
      />
    </div>
  );
}
