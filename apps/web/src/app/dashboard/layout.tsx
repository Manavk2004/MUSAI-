import { Sidebar } from "@/components/layout/sidebar";
import { PlayerBar } from "@/components/layout/player-bar";
import { SpotifyPlayerProvider } from "@/providers/spotify-player-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SpotifyPlayerProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 min-h-screen">
          <div className="p-8 pb-24">{children}</div>
        </main>
        <PlayerBar />
      </div>
    </SpotifyPlayerProvider>
  );
}
