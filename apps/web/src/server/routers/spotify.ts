import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { SpotifyAPI } from "@/lib/spotify";
import { TRPCError } from "@trpc/server";

export const spotifyRouter = createTRPCRouter({
  getTopTracks: protectedProcedure
    .input(
      z.object({
        timeRange: z
          .enum(["short_term", "medium_term", "long_term"])
          .default("medium_term"),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.getTopTracks(input.timeRange, input.limit);
    }),

  getTopArtists: protectedProcedure
    .input(
      z.object({
        timeRange: z
          .enum(["short_term", "medium_term", "long_term"])
          .default("medium_term"),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.getTopArtists(input.timeRange, input.limit);
    }),

  getSavedTracks: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.getSavedTracks(input.limit, input.offset);
    }),

  getPlaylists: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.getUserPlaylists(input.limit, input.offset);
    }),

  getRecentlyPlayed: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.getRecentlyPlayed(input.limit);
    }),

  getAudioFeatures: protectedProcedure
    .input(
      z.object({
        trackIds: z.array(z.string()).min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.getAudioFeatures(input.trackIds);
    }),

  searchTracks: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.searchTracks(input.query, input.limit);
    }),

  getAccessToken: protectedProcedure.query(async ({ ctx }) => {
    const spotify = await SpotifyAPI.fromUserId(ctx.userId);
    return { accessToken: spotify.getToken() };
  }),

  play: protectedProcedure
    .input(
      z.object({
        trackUris: z.array(z.string()).optional(),
        contextUri: z.string().optional(),
        deviceId: z.string().optional(),
        offset: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.play(input);
    }),

  pause: protectedProcedure
    .input(z.object({ deviceId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.pause(input.deviceId);
    }),

  seek: protectedProcedure
    .input(z.object({ positionMs: z.number(), deviceId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.seek(input.positionMs, input.deviceId);
    }),

  setVolume: protectedProcedure
    .input(z.object({ volumePercent: z.number().min(0).max(100), deviceId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.setVolume(input.volumePercent, input.deviceId);
    }),

  skipNext: protectedProcedure
    .input(z.object({ deviceId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.skipNext(input.deviceId);
    }),

  skipPrevious: protectedProcedure
    .input(z.object({ deviceId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      return spotify.skipPrevious(input.deviceId);
    }),

  createPlaylist: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
        trackUris: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      try {
        const playlist = await spotify.createPlaylistWithTracks(
          input.name,
          input.description || "",
          input.isPublic,
          input.trackUris
        );
        return playlist;
      } catch (err) {
        console.error("[createPlaylist] failed:", err instanceof Error ? err.message : err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Failed to create playlist: ${err instanceof Error ? err.message : "Unknown error"}` });
      }
    }),
});
