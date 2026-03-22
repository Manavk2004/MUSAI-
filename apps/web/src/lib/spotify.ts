import { clerkClient } from "@clerk/nextjs/server";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export class SpotifyAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  static async fromUserId(userId: string): Promise<SpotifyAPI> {
    const client = await clerkClient();
    const tokenResponse = await client.users.getUserOauthAccessToken(
      userId,
      "spotify"
    );

    const token = tokenResponse.data[0]?.token;
    if (!token) {
      throw new Error(
        "Spotify not connected. Please connect your Spotify account."
      );
    }

    return new SpotifyAPI(token);
  }

  getToken(): string {
    return this.accessToken;
  }

  private async fetch(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Spotify API error: ${response.status} ${error?.error?.message || response.statusText}`
      );
    }

    return response.json();
  }

  async getCurrentUser() {
    return this.fetch("/me");
  }

  async getTopTracks(
    timeRange: string = "medium_term",
    limit: number = 20
  ) {
    return this.fetch(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );
  }

  async getTopArtists(
    timeRange: string = "medium_term",
    limit: number = 20
  ) {
    return this.fetch(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
  }

  async getSavedTracks(limit: number = 20, offset: number = 0) {
    return this.fetch(`/me/tracks?limit=${limit}&offset=${offset}`);
  }

  async getUserPlaylists(limit: number = 20, offset: number = 0) {
    return this.fetch(`/me/playlists?limit=${limit}&offset=${offset}`);
  }

  async getRecentlyPlayed(limit: number = 20) {
    return this.fetch(`/me/player/recently-played?limit=${limit}`);
  }

  async getAudioFeatures(trackIds: string[]) {
    return this.fetch(`/audio-features?ids=${trackIds.join(",")}`);
  }

  async searchTracks(query: string, limit: number = 10) {
    return this.fetch(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
    );
  }

  async createPlaylist(
    userId: string,
    name: string,
    description: string,
    isPublic: boolean
  ) {
    return this.fetch(`/users/${userId}/playlists`, {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    });
  }

  async play(options: {
    trackUris?: string[];
    contextUri?: string;
    deviceId?: string;
    offset?: number;
  }) {
    const body: Record<string, unknown> = {};
    if (options.trackUris) body.uris = options.trackUris;
    if (options.contextUri) body.context_uri = options.contextUri;
    if (options.offset !== undefined) body.offset = { position: options.offset };

    const query = options.deviceId ? `?device_id=${options.deviceId}` : "";
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/play${query}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Spotify API error: ${response.status} ${error?.error?.message || response.statusText}`
      );
    }
    return { success: true };
  }

  async pause(deviceId?: string) {
    const query = deviceId ? `?device_id=${deviceId}` : "";
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/pause${query}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Spotify API error: ${response.status} ${error?.error?.message || response.statusText}`);
    }
    return { success: true };
  }

  async seek(positionMs: number, deviceId?: string) {
    const query = `?position_ms=${positionMs}${deviceId ? `&device_id=${deviceId}` : ""}`;
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/seek${query}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Spotify API error: ${response.status} ${error?.error?.message || response.statusText}`);
    }
    return { success: true };
  }

  async setVolume(volumePercent: number, deviceId?: string) {
    const query = `?volume_percent=${volumePercent}${deviceId ? `&device_id=${deviceId}` : ""}`;
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/volume${query}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Spotify API error: ${response.status} ${error?.error?.message || response.statusText}`);
    }
    return { success: true };
  }

  async skipNext(deviceId?: string) {
    const query = deviceId ? `?device_id=${deviceId}` : "";
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/next${query}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Spotify API error: ${response.status} ${error?.error?.message || response.statusText}`);
    }
    return { success: true };
  }

  async skipPrevious(deviceId?: string) {
    const query = deviceId ? `?device_id=${deviceId}` : "";
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/previous${query}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Spotify API error: ${response.status} ${error?.error?.message || response.statusText}`);
    }
    return { success: true };
  }

  async addTracksToPlaylist(playlistId: string, uris: string[]) {
    // Spotify allows max 100 tracks per request
    const chunks = [];
    for (let i = 0; i < uris.length; i += 100) {
      chunks.push(uris.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      await this.fetch(`/playlists/${playlistId}/tracks`, {
        method: "POST",
        body: JSON.stringify({ uris: chunk }),
      });
    }
  }
}
