"use client";

import { useUser, UserProfile } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useUser();
  const { data: profile, isLoading } = trpc.user.getProfile.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account and connected services
        </p>
      </div>

      {/* Spotify Connection Status */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Connected Services
        </h2>

        <div className="space-y-4">
          {/* Spotify */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1DB954]/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#1DB954]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Spotify</p>
                {isLoading ? (
                  <p className="text-xs text-muted-foreground">Checking...</p>
                ) : profile?.spotifyConnected ? (
                  <p className="text-xs text-muted-foreground">
                    {profile.spotifyProfile?.displayName} &middot;{" "}
                    <span
                      className={cn(
                        profile.spotifyProfile?.product === "premium"
                          ? "text-emerald-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {profile.spotifyProfile?.product === "premium"
                        ? "Premium"
                        : "Free"}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-red-400">Not connected</p>
                )}
              </div>
            </div>

            {profile?.spotifyConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>

          {!profile?.spotifyConnected && !isLoading && (
            <p className="text-sm text-muted-foreground">
              Connect your Spotify account through your{" "}
              <span className="text-emerald-500">profile settings</span> below
              to use MUSAI.
            </p>
          )}
        </div>
      </div>

      {/* Clerk User Profile */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Account
        </h2>
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none bg-transparent border-none w-full",
              navbar: "hidden",
              pageScrollBox: "p-0",
            },
          }}
        />
      </div>
    </div>
  );
}
