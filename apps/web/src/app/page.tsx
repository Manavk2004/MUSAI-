import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-black font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold text-foreground">MUSAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-800/50 bg-emerald-950/30 text-emerald-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI-Powered Music Discovery
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Your music.</span>
            <br />
            <span className="text-emerald-500">Reimagined by AI.</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            MUSAI analyzes your Spotify listening habits and generates
            personalized playlists you&apos;ve never heard before. Discover your
            next favorite song.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="bg-emerald-600 hover:bg-emerald-500 text-black font-semibold px-8 py-3 rounded-lg text-lg transition-colors emerald-glow-strong"
            >
              Start Discovering
            </Link>
            <Link
              href="#features"
              className="border border-emerald-800/50 hover:border-emerald-600/50 text-foreground px-8 py-3 rounded-lg text-lg transition-colors"
            >
              Learn More
            </Link>
          </div>

          {/* Feature cards */}
          <div
            id="features"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          >
            <div className="glass rounded-xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h3 className="text-foreground font-semibold mb-2">
                Smart Analysis
              </h3>
              <p className="text-muted-foreground text-sm">
                AI analyzes your top tracks, artists, and audio preferences to
                understand your unique taste.
              </p>
            </div>

            <div className="glass rounded-xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-foreground font-semibold mb-2">
                Instant Playlists
              </h3>
              <p className="text-muted-foreground text-sm">
                Generate customized playlists in seconds. Choose your mood,
                genre, and how adventurous you want to be.
              </p>
            </div>

            <div className="glass rounded-xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-foreground font-semibold mb-2">
                Daily Picks
              </h3>
              <p className="text-muted-foreground text-sm">
                Get a daily AI-curated song recommendation with a built-in
                preview player.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-6 text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} MUSAI. Powered by AI and the Spotify
        API.
      </footer>
    </div>
  );
}
