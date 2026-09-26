import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lifta — Workout Tracker",
  description: "Workout tracker.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lifta",
  },
};

export const viewport: Viewport = {
  themeColor: "#fe4c00",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-lvh antialiased`}
      // The theme script below sets data-theme on this element before React
      // hydrates (to avoid a flash of the wrong theme), which the server
      // markup can't know about in advance -- expected, not a real mismatch.
      suppressHydrationWarning
    >
      <head>
        {/* Blocking (not deferred) so the theme is set before first paint --
            otherwise a light-mode user would see a flash of dark mode. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var s=JSON.parse(localStorage.getItem("lifta:settings")||"{}");if(s.theme==="light")document.documentElement.setAttribute("data-theme","light");}catch(e){}})();',
          }}
        />
      </head>
      <body className="flex h-lvh flex-col overflow-y-auto pt-[env(safe-area-inset-top)]">
        {children}
      </body>
    </html>
  );
}
