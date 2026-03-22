import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TasteProfile {
  topArtists: Array<{ name: string; genres: string[] }>;
  topTracks: Array<{ name: string; artist: string }>;
  audioProfile: {
    avgDanceability: number;
    avgEnergy: number;
    avgValence: number;
    avgTempo: number;
    avgAcousticness: number;
    avgInstrumentalness: number;
  };
}

interface GeneratePlaylistInput {
  tasteProfile: TasteProfile;
  mood: string;
  genre?: string;
  adventurousness: number;
  songCount: number;
  additionalNotes?: string;
  existingTracks: string[];
}

interface TrackRecommendation {
  name: string;
  artist: string;
}

export async function generatePlaylistWithAI(
  input: GeneratePlaylistInput
): Promise<TrackRecommendation[]> {
  const {
    tasteProfile,
    mood,
    genre,
    adventurousness,
    songCount,
    additionalNotes,
    existingTracks,
  } = input;

  const adventurenessLabel =
    adventurousness < 25
      ? "very similar to their current taste"
      : adventurousness < 50
        ? "somewhat familiar with slight exploration"
        : adventurousness < 75
          ? "a balanced mix of familiar and new territory"
          : "highly exploratory and surprising";

  const prompt = `You are a music curator AI. Based on the user's listening profile, generate a playlist of exactly ${songCount} songs.

USER'S TASTE PROFILE:
- Top Artists: ${tasteProfile.topArtists.map((a) => `${a.name} (${(a.genres || []).slice(0, 3).join(", ")})`).join(", ")}
- Top Tracks: ${tasteProfile.topTracks.slice(0, 15).map((t) => `"${t.name}" by ${t.artist}`).join(", ")}
- Audio Profile: Danceability ${tasteProfile.audioProfile.avgDanceability}, Energy ${tasteProfile.audioProfile.avgEnergy}, Valence/Happiness ${tasteProfile.audioProfile.avgValence}, Avg Tempo ${tasteProfile.audioProfile.avgTempo} BPM, Acousticness ${tasteProfile.audioProfile.avgAcousticness}

PLAYLIST REQUIREMENTS:
- Mood: ${mood}
${genre ? `- Genre focus: ${genre}` : "- Genre: Based on user's taste profile"}
- Discovery level: ${adventurenessLabel} (${adventurousness}/100)
${additionalNotes ? `- Additional notes: ${additionalNotes}` : ""}

IMPORTANT RULES:
1. Suggest REAL songs that exist on Spotify
2. Avoid duplicating these tracks the user already knows: ${existingTracks.slice(0, 20).join(", ")}
3. It's OK to include a few familiar songs (up to 20%) but the majority should be discoveries
4. The playlist should flow well - consider song order for a good listening experience
5. Match the requested mood consistently throughout

Respond with a JSON object containing a "tracks" key with an array of exactly ${songCount} objects, each with "name" and "artist" fields. Example: {"tracks": [{"name": "Song", "artist": "Artist"}, ...]}`;

  let response;
  try {
    response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8 + (adventurousness / 100) * 0.4,
      response_format: { type: "json_object" },
    });
  } catch (err) {
    console.error("[openai] API call failed:", err instanceof Error ? err.message : err);
    throw new Error(`OpenAI API error: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  const content = response.choices[0]?.message?.content;
  console.log("[openai] Response content:", content?.substring(0, 200));
  if (!content) {
    console.error("[openai] Empty response. Finish reason:", response.choices[0]?.finish_reason);
    throw new Error("Failed to generate playlist recommendations");
  }

  try {
    const parsed = JSON.parse(content);
    let tracks: TrackRecommendation[];

    if (Array.isArray(parsed)) {
      tracks = parsed;
    } else if (parsed.tracks || parsed.songs || parsed.playlist || parsed.recommendations) {
      tracks = parsed.tracks || parsed.songs || parsed.playlist || parsed.recommendations;
    } else if (parsed.name && parsed.artist) {
      // Single object response — wrap in array
      tracks = [parsed];
    } else {
      // Try to find any array property in the response
      const arrayProp = Object.values(parsed).find(Array.isArray) as TrackRecommendation[] | undefined;
      tracks = arrayProp || [];
    }

    // Filter to only valid track objects
    tracks = tracks.filter(
      (t): t is TrackRecommendation =>
        typeof t === "object" && t !== null && typeof t.name === "string" && typeof t.artist === "string"
    );

    console.log(`[openai] Parsed ${tracks.length} tracks`);
    return tracks.slice(0, songCount);
  } catch {
    throw new Error("Failed to parse AI response");
  }
}

export async function generateDailyRecommendation(
  tasteProfile: TasteProfile
): Promise<TrackRecommendation> {
  const prompt = `You are a music discovery AI. Based on this user's taste profile, recommend ONE hidden gem song they'd love but likely haven't heard.

USER'S TASTE:
- Artists they love: ${tasteProfile.topArtists.slice(0, 10).map((a) => a.name).join(", ")}
- Genres: ${[...new Set(tasteProfile.topArtists.flatMap((a) => a.genres || []))].slice(0, 10).join(", ")}
- They prefer: Energy ${tasteProfile.audioProfile.avgEnergy}, Danceability ${tasteProfile.audioProfile.avgDanceability}, Valence ${tasteProfile.audioProfile.avgValence}

Respond with ONLY a JSON object: {"name": "Song Name", "artist": "Artist Name", "reason": "Brief reason why they'd love this"}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 1.0,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate recommendation");
  }

  return JSON.parse(content);
}
