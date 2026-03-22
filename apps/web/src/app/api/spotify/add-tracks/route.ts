import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  let token = cookieStore.get("spotify_playlist_token")?.value;

  // Try refreshing if no token but refresh token exists
  if (!token) {
    const refreshToken = cookieStore.get("spotify_playlist_refresh")?.value;
    if (refreshToken) {
      const refreshResp = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (refreshResp.ok) {
        const data = await refreshResp.json();
        token = data.access_token;
        cookieStore.set("spotify_playlist_token", data.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: data.expires_in || 3600,
          path: "/",
        });
      }
    }
  }

  if (!token) {
    return NextResponse.json(
      { error: "No playlist token. Please authorize Spotify for playlist access." },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { playlistId, uris } = body;

  if (!playlistId || !uris?.length) {
    return NextResponse.json({ error: "Missing playlistId or uris" }, { status: 400 });
  }

  // Add tracks in chunks of 100
  let addedCount = 0;
  for (let i = 0; i < uris.length; i += 100) {
    const chunk = uris.slice(i, i + 100);
    const resp = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: chunk }),
      }
    );

    if (!resp.ok) {
      const error = await resp.json().catch(() => ({}));
      console.error("[add-tracks] Failed:", resp.status, error);
      return NextResponse.json(
        {
          error: `Spotify error: ${resp.status} ${error?.error?.message || ""}`,
          addedCount,
          totalRequested: uris.length,
        },
        { status: resp.status }
      );
    }
    addedCount += chunk.length;
  }

  return NextResponse.json({ success: true });
}
