"use client";

import { SignInButton } from "@clerk/nextjs";

type GoogleSignInButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

export function GoogleSignInButton({ className, children }: GoogleSignInButtonProps) {
  const hasKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasKey) {
    return (
      <button type="button" className={className} disabled title="Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY">
        {children ?? "Continue with Google"}
      </button>
    );
  }

  return (
    <SignInButton mode="modal" forceRedirectUrl="/" signUpForceRedirectUrl="/">
      <button type="button" className={className}>
        {children ?? "Continue with Google"}
      </button>
    </SignInButton>
  );
}
