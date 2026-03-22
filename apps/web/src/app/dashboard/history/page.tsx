"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import { ExternalLink, Music, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { user } = useUser();
  const playlists = useQuery(
    api.playlists.getByUser,
    user?.id ? { userId: user.id, limit: 50 } : "skip"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Playlist History
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your AI-generated playlists
        </p>
      </div>

      {!playlists || playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No playlists yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Head over to the Generate page to create your first AI-powered
            playlist
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-card rounded-xl border border-border p-5 hover:border-emerald-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {playlist.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        "bg-emerald-600/10 text-emerald-500 border border-emerald-800/30"
                      )}
                    >
                      {playlist.mood}
                    </span>
                    {playlist.genre && (
                      <span className="text-xs text-muted-foreground">
                        {playlist.genre}
                      </span>
                    )}
                  </div>
                </div>
                {playlist.spotifyPlaylistId && (
                  <a
                    href={`https://open.spotify.com/playlist/${playlist.spotifyPlaylistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Track preview */}
              <div className="flex -space-x-2 mb-3">
                {playlist.tracks.slice(0, 5).map((track, i) => (
                  <div
                    key={i}
                    className="relative w-8 h-8 rounded border-2 border-card overflow-hidden"
                  >
                    {track.imageUrl ? (
                      <Image
                        src={track.imageUrl}
                        alt={track.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                  </div>
                ))}
                {playlist.tracks.length > 5 && (
                  <div className="w-8 h-8 rounded border-2 border-card bg-secondary flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">
                      +{playlist.tracks.length - 5}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{playlist.songCount} tracks</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(playlist.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
