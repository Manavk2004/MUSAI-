import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { SpotifyAPI } from "@/lib/spotify";

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const spotify = await SpotifyAPI.fromUserId(ctx.userId);
      const profile = await spotify.getCurrentUser();
      return {
        spotifyConnected: true,
        spotifyProfile: {
          id: profile.id,
          displayName: profile.display_name,
          email: profile.email,
          image: profile.images?.[0]?.url,
          product: profile.product, // "premium", "free", etc.
          country: profile.country,
        },
      };
    } catch {
      return {
        spotifyConnected: false,
        spotifyProfile: null,
      };
    }
  }),
});
