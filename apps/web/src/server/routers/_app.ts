import { createTRPCRouter } from "@/server/trpc";
import { spotifyRouter } from "./spotify";
import { playlistRouter } from "./playlist";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  spotify: spotifyRouter,
  playlist: playlistRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
