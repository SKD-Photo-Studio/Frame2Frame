import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <Sidebar />
        {/* pt-14 for mobile top header, pb-20 for mobile bottom tab bar, md:ml-64 for desktop sidebar */}
        <main className="min-h-screen pt-14 pb-20 md:ml-64 md:pt-0 md:pb-0">
          <div className="px-4 py-4 sm:px-6 md:px-8 md:py-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
