import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { generatePlaylistWithAI } from "@/lib/openai";
import { SpotifyAPI } from "@/lib/spotify";

export const playlistRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z
        .object({
          mood: z
            .enum([
              "chill",
              "energetic",
              "focused",
              "party",
              "melancholy",
              "romantic",
              "workout",
            ])
            .optional(),
          genre: z.string().max(100).optional(),
          songCount: z.enum(["10", "20", "30", "50"]).default("20"),
          additionalNotes: z.string().max(500).optional(),
          seedTracks: z
            .array(
              z.object({
                name: z.string().max(200),
                artist: z.string().max(200),
              })
            )
            .max(10)
            .optional(),
        })
        .refine(
          (data) =>
            data.mood ||
            (data.seedTracks && data.seedTracks.length > 0),
          {
            message: "Either a mood or seed tracks must be provided",
          }
        )
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const spotify = await SpotifyAPI.fromUserId(ctx.userId);

        // Gather user's taste profile (each call may fail independently)
        let topTracks: any = { items: [] };
        let topArtists: any = { items: [] };
        let audioFeatures: { audio_features: any[] } = {
          audio_features: [],
        };

        const [tracksResult, artistsResult] = await Promise.allSettled([
          spotify.getTopTracks("medium_term", 50),
          spotify.getTopArtists("medium_term", 20),
        ]);

        if (tracksResult.status === "fulfilled")
          topTracks = tracksResult.value;
        if (artistsResult.status === "fulfilled")
          topArtists = artistsResult.value;

        const trackItems = topTracks?.items ?? [];
        const artistItems = topArtists?.items ?? [];
        const trackIds = trackItems.map((t: any) => t.id);

        if (trackIds.length > 0) {
          try {
            audioFeatures = await spotify.getAudioFeatures(trackIds);
          } catch {
            // Audio features endpoint may be restricted — continue without them
          }
        }

        // Build taste profile for GPT-4o
        const tasteProfile = {
          topArtists: artistItems.map((a: any) => ({
            name: a.name,
            genres: a.genres || [],
          })),
          topTracks: trackItems.map((t: any) => ({
            name: t.name,
            artist: t.artists?.[0]?.name,
          })),
          audioProfile: summarizeAudioFeatures(
            audioFeatures?.audio_features ?? []
          ),
        };

        // Generate recommendations with GPT-4o
        const songCount = parseInt(input.songCount);
        const recommendations = await generatePlaylistWithAI({
          tasteProfile,
          mood: input.mood,
          genre: input.genre,
          songCount,
          additionalNotes: input.additionalNotes,
          existingTracks: trackItems.map(
            (t: any) => `${t.name} - ${t.artists?.[0]?.name}`
          ),
          seedTracks: input.seedTracks,
        });

        // Resolve track names to Spotify URIs
        const resolvedTracks: Array<{
          uri: string;
          name: string;
          artist: string;
          album: string;
          image: string;
          previewUrl: string | null;
        }> = [];

        console.log(
          `[playlist.generate] GPT returned ${recommendations.length} recommendations`
        );

        // Search in parallel batches of 5 to avoid rate limits
        const batchSize = 5;
        for (let i = 0; i < recommendations.length; i += batchSize) {
          const batch = recommendations.slice(i, i + batchSize);
          const results = await Promise.allSettled(
            batch.map(async (rec) => {
              const searchResult = await spotify.searchTracks(
                `${rec.name} ${rec.artist}`,
                1
              );
              if (searchResult.tracks?.items?.length > 0) {
                const track = searchResult.tracks.items[0];
                return {
                  uri: track.uri,
                  name: track.name,
                  artist: track.artists[0]?.name || rec.artist,
                  album: track.album?.name || "",
                  image: track.album?.images?.[0]?.url || "",
                  previewUrl: track.preview_url,
                };
              }
              return null;
            })
          );
          for (const result of results) {
            if (result.status === "fulfilled" && result.value) {
              resolvedTracks.push(result.value);
            }
          }
        }

        return {
          tracks: resolvedTracks,
          mood: input.mood,
          genre: input.genre,
          songCount,
        };
      } catch (err) {
        console.error("[playlist.generate] FULL ERROR:", err);
        throw err;
      }
    }),
});

function summarizeAudioFeatures(features: any[]) {
  if (!features || features.length === 0) {
    return {
      avgDanceability: 0,
      avgEnergy: 0,
      avgValence: 0,
      avgTempo: 0,
      avgAcousticness: 0,
      avgInstrumentalness: 0,
    };
  }

  const valid = features.filter(Boolean);
  const avg = (key: string) =>
    valid.reduce((sum: number, f: any) => sum + (f[key] || 0), 0) /
    valid.length;

  return {
    avgDanceability: Math.round(avg("danceability") * 100) / 100,
    avgEnergy: Math.round(avg("energy") * 100) / 100,
    avgValence: Math.round(avg("valence") * 100) / 100,
    avgTempo: Math.round(avg("tempo")),
    avgAcousticness: Math.round(avg("acousticness") * 100) / 100,
    avgInstrumentalness: Math.round(avg("instrumentalness") * 100) / 100,
  };
}
