import type { Metadata } from "next";
import { Arvo, Karla } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

const arvo = Arvo({
  variable: "--font-arvo",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eisenhower Grid",
  description: "Prioritize your tasks with the Eisenhower Matrix.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${arvo.variable} ${karla.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-ui">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
