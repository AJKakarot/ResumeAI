import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { AppToaster } from "@/components/AppToaster";
import { AuthToastListener } from "@/components/AuthToastListener";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResumeAI",
  description: "Optimize your resume with AI — ATS score and actionable insights",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const shell = (
    <>
      {children}
      <AppToaster />
      {publishableKey ? <AuthToastListener /> : null}
    </>
  );

  const content = publishableKey ? (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#f97316",
          colorTextOnPrimaryBackground: "#431407",
        },
      }}
    >
      {shell}
    </ClerkProvider>
  ) : (
    shell
  );

  return (
    <html lang="en" data-theme="dark" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{content}</body>
    </html>
  );
}
