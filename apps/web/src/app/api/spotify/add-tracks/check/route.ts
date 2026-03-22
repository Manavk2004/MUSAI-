import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("spotify_playlist_token")?.value;
  const refreshToken = cookieStore.get("spotify_playlist_refresh")?.value;

  if (!token) {
    return NextResponse.json({ hasToken: false, hasRefreshToken: !!refreshToken });
  }

  return NextResponse.json({ hasToken: true });
}
