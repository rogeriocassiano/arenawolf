import type { Metadata, Viewport } from "next";
import { Inter, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0D1117",
};

export const metadata: Metadata = {
  title: "Arena Wolf — Lan House Premium BH",
  description:
    "Arena Wolf: a melhor lan house de Belo Horizonte. Reserve seu PC Gamer ou PS5 online, veja disponibilidade em tempo real e aproveite promoções exclusivas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arena Wolf",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-wolf-bg text-wolf-white antialiased">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#161B22",
              border: "1px solid rgba(77,166,255,0.2)",
              color: "#E8F4FF",
            },
          }}
        />
      </body>
    </html>
  );
}
