import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("spotify_oauth_state")?.value;
  cookieStore.delete("spotify_oauth_state");

  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/dashboard/generate?spotify_error=invalid_state", request.url)
    );
  }

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/dashboard/generate?spotify_error=denied", request.url)
    );
  }

  // Exchange code for access token
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/spotify/callback`,
    }),
  });

  if (!tokenResponse.ok) {
    console.error("[spotify-callback] Token exchange failed:", await tokenResponse.text());
    return NextResponse.redirect(
      new URL("/dashboard/generate?spotify_error=token_failed", request.url)
    );
  }

  const tokenData = await tokenResponse.json();

  // Store the token in an httpOnly cookie
  cookieStore.set("spotify_playlist_token", tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: tokenData.expires_in || 3600,
    path: "/",
  });

  if (tokenData.refresh_token) {
    cookieStore.set("spotify_playlist_refresh", tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  // Redirect to the configured app URL so cookies match the domain the user accesses
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(
    `${appUrl}/dashboard/generate?spotify_authorized=true`
  );
}
