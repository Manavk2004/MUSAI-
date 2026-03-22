"use client";

import { trpc } from "@/lib/trpc";
import Image from "next/image";
import { cn } from "@/lib/utils";

function AudioFeatureBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function TasteProfilePage() {
  const { data: topArtists, isLoading: loadingArtists } =
    trpc.spotify.getTopArtists.useQuery({
      timeRange: "medium_term",
      limit: 20,
    });

  const { data: topTracks, isLoading: loadingTracks } =
    trpc.spotify.getTopTracks.useQuery({
      timeRange: "medium_term",
      limit: 50,
    });

  const trackIds = topTracks?.items?.map((t: any) => t.id) || [];
  const { data: audioFeatures } = trpc.spotify.getAudioFeatures.useQuery(
    { trackIds },
    { enabled: trackIds.length > 0 }
  );

  // Calculate average audio features
  const features = audioFeatures?.audio_features?.filter(Boolean) || [];
  const avg = (key: string) =>
    features.length > 0
      ? features.reduce((sum: number, f: any) => sum + (f[key] || 0), 0) /
        features.length
      : 0;

  const audioProfile = {
    danceability: avg("danceability"),
    energy: avg("energy"),
    valence: avg("valence"),
    acousticness: avg("acousticness"),
    instrumentalness: avg("instrumentalness"),
    speechiness: avg("speechiness"),
    liveness: avg("liveness"),
  };

  // Extract top genres
  const genreCounts: Record<string, number> = {};
  topArtists?.items?.forEach((artist: any) => {
    artist.genres?.forEach((genre: string) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);
  const maxGenreCount = topGenres[0]?.[1] || 1;

  const isLoading = loadingArtists || loadingTracks;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Taste Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          A visual breakdown of your music DNA
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-6 h-64 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audio Profile */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Audio Profile
            </h2>
            <div className="space-y-4">
              <AudioFeatureBar
                label="Danceability"
                value={audioProfile.danceability}
              />
              <AudioFeatureBar
                label="Energy"
                value={audioProfile.energy}
              />
              <AudioFeatureBar
                label="Happiness"
                value={audioProfile.valence}
              />
              <AudioFeatureBar
                label="Acousticness"
                value={audioProfile.acousticness}
              />
              <AudioFeatureBar
                label="Instrumentalness"
                value={audioProfile.instrumentalness}
              />
              <AudioFeatureBar
                label="Speechiness"
                value={audioProfile.speechiness}
              />
              <AudioFeatureBar
                label="Liveness"
                value={audioProfile.liveness}
              />
            </div>
          </div>

          {/* Top Genres */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Top Genres
            </h2>
            <div className="space-y-3">
              {topGenres.map(([genre, count]) => (
                <div key={genre} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground capitalize">{genre}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/60 rounded-full"
                      style={{
                        width: `${(count / maxGenreCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {topGenres.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No genre data available
                </p>
              )}
            </div>
          </div>

          {/* Top Artists Grid */}
          <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Top Artists
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {topArtists?.items?.slice(0, 10).map((artist: any, i: number) => (
                <a
                  key={artist.id}
                  href={artist.external_urls?.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-center"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2">
                    {artist.images?.[0]?.url ? (
                      <Image
                        src={artist.images[0].url}
                        alt={artist.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-2 left-2 text-xs font-bold text-emerald-500 bg-black/50 rounded-full w-6 h-6 flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-emerald-500 transition-colors">
                    {artist.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {artist.genres?.slice(0, 2).join(", ")}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
