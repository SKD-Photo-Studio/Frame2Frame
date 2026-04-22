import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/client-shell";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "Frame2Frame",
  description: "Advanced Event Production Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className={`${inter.className} ${outfit.variable}`}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
