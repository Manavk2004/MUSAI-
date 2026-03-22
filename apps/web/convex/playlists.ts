import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const save = mutation({
  args: {
    userId: v.string(),
    spotifyPlaylistId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    mood: v.string(),
    genre: v.optional(v.string()),
    adventurousness: v.number(),
    songCount: v.number(),
    tracks: v.array(
      v.object({
        spotifyUri: v.string(),
        name: v.string(),
        artist: v.string(),
        album: v.string(),
        imageUrl: v.string(),
        previewUrl: v.optional(v.string()),
      })
    ),
    savedToSpotify: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generatedPlaylists", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getByUser = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("generatedPlaylists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const markSavedToSpotify = mutation({
  args: {
    playlistId: v.id("generatedPlaylists"),
    spotifyPlaylistId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.playlistId, {
      savedToSpotify: true,
      spotifyPlaylistId: args.spotifyPlaylistId,
    });
  },
});
