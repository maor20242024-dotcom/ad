import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Imperium Gate | استثمر في دبي بحماية كاملة",
  description: "Imperium Gate - شريكك الموثوق في عقارات دبي. نفس سعر المطوّر تماماً، لكن مع فريق يحمي استثمارك ويكون في صفّك. استشارة مجانية مع مستشار عربي متخصص.",
  keywords: ["Imperium Gate", "عقارات دبي", "استثمار عقاري", "شقق دبي", "استشارة عقارية", "حماية استثمار", "Dubai Real Estate"],
  authors: [{ name: "Imperium Gate" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Imperium Gate | استثمر في دبي بحماية كاملة",
    description: "نفس سعر المطوّر تماماً، لكن مع فريق يحمي استثمارك. استشارة مجانية مع مستشار عربي متخصص في عقارات دبي.",
    url: "https://imperiumgate.com",
    siteName: "Imperium Gate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imperium Gate | استثمر في دبي بحماية كاملة",
    description: "نفس سعر المطوّر تماماً، لكن مع فريق يحمي استثمارك. استشارة مجانية مع مستشار عربي متخصص.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <script id="native-ads-pixel">
                !function (e, s, t, a, n, p, i, o, c){
                  e[n] || ((i = e[n] = function (){
                    i.process ? i.process.apply(i, arguments) : i.queue.push(arguments)
                  }).queue = [], i.t = 1 * new Date, 
                  (o = s.createElement(t)).async = 1,
                  o.src = "https://cdn.speakol.com/pixel/js/sppixel.min.js?t=" + 864e5 * Math.ceil(new Date / 864e5),
                  (c = s.getElementsByTagName(t)[0]).parentNode.insertBefore(o, c)
                }(window, document, "script", 0, "spix"),
                spix("init", "ID-20401"),
                spix("event", "pageload");
              </script>
            `
          }}
        />
      </body>
    </html>
  );
}
