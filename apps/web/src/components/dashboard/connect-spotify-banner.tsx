"use client";

import { trpc } from "@/lib/trpc";
import { Music, ExternalLink, Loader2 } from "lucide-react";

export function ConnectSpotifyBanner() {
  const { data: profile, isLoading } = trpc.user.getProfile.useQuery();

  if (isLoading) return null;
  if (profile?.spotifyConnected) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-800/40 bg-gradient-to-r from-emerald-950/60 via-emerald-900/30 to-card p-6 emerald-glow">
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-emerald-600/10 blur-2xl" />
      <div className="absolute -right-2 -bottom-2 w-20 h-20 rounded-full bg-emerald-600/5 blur-xl" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Spotify icon */}
          <div className="w-14 h-14 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-7 h-7 text-[#1DB954]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Connect your Spotify account
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Link Spotify to see your top tracks, get AI recommendations, and
              generate personalized playlists
            </p>
          </div>
        </div>

        <a
          href="/dashboard/settings"
          className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap flex-shrink-0"
        >
          <Music className="w-4 h-4" />
          Connect Spotify
        </a>
      </div>
    </div>
  );
}
