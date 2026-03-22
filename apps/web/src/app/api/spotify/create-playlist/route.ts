import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

async function getSpotifyToken(): Promise<string | null> {
  const cookieStore = await cookies();
  let token = cookieStore.get("spotify_playlist_token")?.value;

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

  return token || null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json(
      { error: "No Spotify token. Please authorize Spotify first.", needsAuth: true },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { name, description, isPublic, trackUris } = body;

  if (!name) {
    return NextResponse.json({ error: "Missing playlist name" }, { status: 400 });
  }

  // Create the playlist
  const createResp = await fetch("https://api.spotify.com/v1/me/playlists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description: description || "",
      public: isPublic ?? false,
    }),
  });

  if (!createResp.ok) {
    const err = await createResp.json().catch(() => ({}));
    return NextResponse.json(
      { error: `Failed to create playlist: ${err?.error?.message || createResp.status}` },
      { status: createResp.status }
    );
  }

  const playlist = await createResp.json();
  console.log(`[create-playlist] Created playlist ${playlist.id}, adding ${trackUris?.length || 0} tracks`);

  // Add tracks in chunks of 100 using POST /playlists/{id}/items
  if (trackUris?.length > 0) {
    for (let i = 0; i < trackUris.length; i += 100) {
      const chunk = trackUris.slice(i, i + 100);
      console.log(`[create-playlist] Adding chunk ${i / 100 + 1}: ${chunk.length} tracks, first URI: ${chunk[0]}`);

      const addResp = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/items`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: chunk }),
        }
      );

      const addBody = await addResp.text();
      console.log(`[create-playlist] Add tracks response: ${addResp.status} ${addBody}`);

      if (!addResp.ok) {
        return NextResponse.json(
          { error: `Playlist created but failed to add tracks (${addResp.status}): ${addBody}` },
          { status: addResp.status }
        );
      }
    }
  }

  return NextResponse.json({ id: playlist.id, url: playlist.external_urls?.spotify });
}
