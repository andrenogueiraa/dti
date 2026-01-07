import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./_providers/providers";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Separator } from "@/components/ui/separator";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DTI",
  description: "DTI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <footer className="bg-background/75 p-2 rounded-full shadow fixed bottom-4 left-1/2 -translate-x-1/2 flex justify-center items-center gap-4">
            <Link href="/past-projects">
              <Icon
                icon="material-symbols:fast-rewind-rounded"
                className="text-4xl text-muted-foreground hover:text-primary"
              />
            </Link>

            <Link href="/">
              <Icon
                icon="material-symbols:motion-play-outline-rounded"
                className="text-4xl text-muted-foreground hover:text-primary"
              />
            </Link>

            <Link href="/future-projects">
              <Icon
                icon="material-symbols:fast-forward-rounded"
                className="text-4xl text-muted-foreground hover:text-primary"
              />
            </Link>

            <span className="text-border">|</span>

            <Link href="/dashboard" className="pr-2">
              <Icon
                icon="mynaui:kanban-solid"
                className="text-4xl text-muted-foreground hover:text-primary"
              />
            </Link>
          </footer>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
