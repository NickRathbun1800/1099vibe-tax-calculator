import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1099 Tax Calculator | 1099Vibe",
  description:
    "Estimate your 2025 or 2026 federal 1099 taxes, see what percentage to set aside, and uncover potential business deductions.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@700&family=Source+Sans+3:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#176B68" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
