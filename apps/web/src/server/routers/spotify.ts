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
      const profile = await spotify.getCurrentUser();
      const playlist = await spotify.createPlaylist(
        profile.id,
        input.name,
        input.description || "",
        input.isPublic
      );
      if (input.trackUris.length > 0) {
        await spotify.addTracksToPlaylist(playlist.id, input.trackUris);
      }
      return playlist;
    }),
});
