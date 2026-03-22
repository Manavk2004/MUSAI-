import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveDailyRecommendation = mutation({
  args: {
    userId: v.string(),
    trackName: v.string(),
    artistName: v.string(),
    reason: v.string(),
    spotifyUri: v.optional(v.string()),
    previewUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dailyRecommendations", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getLatestForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyRecommendations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
  },
});

export const getByUserAndDate = query({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyRecommendations")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .unique();
  },
});
