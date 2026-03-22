"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { trpc } from "@/lib/trpc";

interface SpotifyTrack {
  uri: string;
  name: string;
  artists: string;
  album: string;
  image?: string;
  duration_ms: number;
}

interface PlayerState {
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  position: number;
  duration: number;
  volume: number;
  deviceId: string | null;
  error: string | null;
  isPremium: boolean | null;
}

interface PlayerContextValue extends PlayerState {
  play: (uris: string[], offset?: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  seek: (positionMs: number) => void;
  setVolume: (volume: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within SpotifyPlayerProvider");
  }
  return context;
}

export function usePlayerOptional() {
  return useContext(PlayerContext);
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (data: any) => void) => void;
  removeListener: (event: string) => void;
  getCurrentState: () => Promise<any>;
  setName: (name: string) => void;
  getVolume: () => Promise<number>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
}

export function SpotifyPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: profile } = trpc.user.getProfile.useQuery();
  const { data: tokenData, refetch: refetchToken } =
    trpc.spotify.getAccessToken.useQuery(undefined, {
      enabled: profile?.spotifyConnected === true,
      refetchInterval: 30 * 60 * 1000, // Refresh every 30 min
    });

  const playMutation = trpc.spotify.play.useMutation();

  const playerRef = useRef<SpotifyPlayer | null>(null);
  const positionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const [state, setState] = useState<PlayerState>({
    isReady: false,
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 0.5,
    deviceId: null,
    error: null,
    isPremium: null,
  });

  // Track premium status
  useEffect(() => {
    if (profile) {
      setState((s) => ({
        ...s,
        isPremium: profile.spotifyProfile?.product === "premium",
      }));
    }
  }, [profile]);

  // Load Spotify Web Playback SDK script
  useEffect(() => {
    if (!profile?.spotifyConnected) return;
    if (profile.spotifyProfile?.product !== "premium") return;
    if (document.getElementById("spotify-player-sdk")) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "spotify-player-sdk";
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      setSdkLoaded(true);
    };

    return () => {
      // Don't remove the script on cleanup — it should persist
    };
  }, [profile?.spotifyConnected, profile?.spotifyProfile?.product]);

  // Initialize player when SDK is ready and we have a token
  useEffect(() => {
    if (!sdkLoaded || !tokenData?.accessToken || !window.Spotify) return;
    if (playerRef.current) return;

    const player = new window.Spotify.Player({
      name: "MUSAI Web Player",
      getOAuthToken: async (cb) => {
        const result = await refetchToken();
        cb(result.data?.accessToken || tokenData.accessToken);
      },
      volume: state.volume,
    });

    player.addListener("ready", ({ device_id }: { device_id: string }) => {
      setState((s) => ({ ...s, isReady: true, deviceId: device_id, error: null }));
    });

    player.addListener(
      "not_ready",
      ({ device_id }: { device_id: string }) => {
        setState((s) => ({ ...s, isReady: false, deviceId: null }));
      }
    );

    player.addListener(
      "player_state_changed",
      (webState: any) => {
        if (!webState) {
          setState((s) => ({
            ...s,
            isPlaying: false,
            currentTrack: null,
            position: 0,
            duration: 0,
          }));
          if (positionIntervalRef.current) {
            clearInterval(positionIntervalRef.current);
            positionIntervalRef.current = null;
          }
          return;
        }

        const track = webState.track_window?.current_track;
        setState((s) => ({
          ...s,
          isPlaying: !webState.paused,
          position: webState.position,
          duration: webState.duration,
          currentTrack: track
            ? {
                uri: track.uri,
                name: track.name,
                artists: track.artists
                  .map((a: { name: string }) => a.name)
                  .join(", "),
                album: track.album.name,
                image: track.album.images?.[0]?.url,
                duration_ms: webState.duration,
              }
            : null,
        }));

        // Update position tracking
        if (positionIntervalRef.current) {
          clearInterval(positionIntervalRef.current);
          positionIntervalRef.current = null;
        }

        if (!webState.paused) {
          let lastPosition = webState.position;
          let lastTime = Date.now();

          positionIntervalRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastTime;
            lastTime = now;
            lastPosition += elapsed;
            setState((s) => ({ ...s, position: Math.min(lastPosition, s.duration) }));
          }, 250);
        }
      }
    );

    player.addListener(
      "initialization_error",
      ({ message }: { message: string }) => {
        setState((s) => ({ ...s, error: `Init error: ${message}` }));
      }
    );

    player.addListener(
      "authentication_error",
      ({ message }: { message: string }) => {
        setState((s) => ({ ...s, error: `Auth error: ${message}` }));
      }
    );

    player.addListener(
      "account_error",
      ({ message }: { message: string }) => {
        setState((s) => ({
          ...s,
          error: `Account error: ${message}. Spotify Premium is required.`,
        }));
      }
    );

    player.connect();
    playerRef.current = player;

    return () => {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
      player.disconnect();
      playerRef.current = null;
      setState((s) => ({ ...s, isReady: false, deviceId: null }));
    };
  }, [sdkLoaded, tokenData?.accessToken]);

  const play = useCallback(
    async (uris: string[], offset = 0) => {
      if (!state.deviceId) return;
      await playMutation.mutateAsync({
        trackUris: uris,
        deviceId: state.deviceId,
        offset,
      });
    },
    [state.deviceId, playMutation]
  );

  const pause = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    playerRef.current?.resume();
  }, []);

  const seek = useCallback((positionMs: number) => {
    playerRef.current?.seek(positionMs);
  }, []);

  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume(volume);
    setState((s) => ({ ...s, volume }));
  }, []);

  const skipNext = useCallback(() => {
    playerRef.current?.nextTrack();
  }, []);

  const skipPrevious = useCallback(() => {
    playerRef.current?.previousTrack();
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        play,
        pause,
        resume,
        seek,
        setVolume,
        skipNext,
        skipPrevious,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
