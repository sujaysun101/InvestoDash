import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <SignIn
        routing="hash"
        forceRedirectUrl="/auth/post-login"
      />
    </main>
  );
}
