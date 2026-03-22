import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { TRPCProvider } from "@/providers/trpc-provider";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MUSAI - AI-Powered Playlist Generation",
  description:
    "Discover new music and generate personalized playlists powered by AI. Connect your Spotify account and let MUSAI curate the perfect soundtrack.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#10b981",
          colorBackground: "#0a0f0d",
          colorText: "#e8f5f0",
          colorInputBackground: "#111a16",
          colorInputText: "#e8f5f0",
        },
        elements: {
          formButtonPrimary:
            "bg-emerald-600 hover:bg-emerald-500 text-black font-semibold",
          card: "bg-[#0d1410] border border-emerald-900/30",
          headerTitle: "text-emerald-50",
          headerSubtitle: "text-emerald-200/60",
          socialButtonsBlockButton:
            "border-emerald-900/30 hover:bg-emerald-950/30",
          formFieldInput: "border-emerald-900/30 focus:border-emerald-500",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={inter.className}>
          <ConvexClientProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
