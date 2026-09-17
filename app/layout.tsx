import type { Metadata } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/site/footer";
import { Nav } from "@/components/site/nav";
import "./globals.css";

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Boxcode — the coding agent that waits for you",
    template: "%s · Boxcode",
  },
  description:
    "An AI coding harness for the terminal and the editor. It reads your files, runs your commands, and waits before anything destructive.",
  metadataBase: new URL("https://boxcode.sh"),
  openGraph: {
    title: "Boxcode",
    description:
      "An AI coding harness for the terminal and the editor. Every destructive action waits for your yes.",
    url: "https://boxcode.sh",
    type: "website",
  },
};

const themeScript = `
(function(){
  try {
    if (localStorage.getItem("boxcode-theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
