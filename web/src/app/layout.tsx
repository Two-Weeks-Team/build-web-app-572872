import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "@/app/globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display"
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "FinFlow AI",
  description: "Turn messy financial goals into an editable, trusted money plan."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${body.variable} bg-background text-foreground font-[--font-body]`}>
        {children}
      </body>
    </html>
  );
}
