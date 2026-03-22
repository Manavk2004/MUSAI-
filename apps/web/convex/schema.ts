import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    spotifyId: v.optional(v.string()),
    spotifyProduct: v.optional(v.string()), // "premium", "free"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_spotify_id", ["spotifyId"]),

  generatedPlaylists: defineTable({
    userId: v.string(), // clerkId
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
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  dailyRecommendations: defineTable({
    userId: v.string(),
    trackName: v.string(),
    artistName: v.string(),
    reason: v.string(),
    spotifyUri: v.optional(v.string()),
    previewUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    date: v.string(), // YYYY-MM-DD
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  analytics: defineTable({
    userId: v.string(),
    event: v.string(), // "playlist_generated", "song_played", "playlist_saved"
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["event"])
    .index("by_created", ["createdAt"]),
});
