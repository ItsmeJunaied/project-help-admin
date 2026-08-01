import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import { themeInitScript } from "@/components/ui/ThemeToggle";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Project Help Admin" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={barlow.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-surface-2 font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
