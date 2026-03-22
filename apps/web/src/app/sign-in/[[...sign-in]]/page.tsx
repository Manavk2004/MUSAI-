import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-black font-bold">M</span>
            </div>
            <span className="text-2xl font-bold text-foreground">MUSAI</span>
          </div>
          <p className="text-muted-foreground">
            Sign in to discover your next favorite song
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none",
            },
          }}
        />
      </div>
    </div>
  );
}
