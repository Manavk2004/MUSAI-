import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const track = mutation({
  args: {
    userId: v.string(),
    event: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analytics", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getEventCounts = query({
  args: {},
  handler: async (ctx) => {
    const allEvents = await ctx.db.query("analytics").collect();
    const counts: Record<string, number> = {};
    for (const event of allEvents) {
      counts[event.event] = (counts[event.event] || 0) + 1;
    }
    return counts;
  },
});

export const getRecentEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("analytics")
      .order("desc")
      .take(limit);
  },
});
