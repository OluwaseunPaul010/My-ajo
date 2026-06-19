import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import FloatingChat from "@/components/FloatingChat";

export const metadata: Metadata = {
  title: "My Ajo - Save Together, Grow Together",
  description: "Nigeria's premier digital savings circle platform. Join trusted ajo groups, save together and receive secure payouts.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Ajo",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="My Ajo" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Script id="tawk-to" strategy="afterInteractive">
  {`
    var Tawk_API = Tawk_API || {};
    Tawk_API.onLoad = function () {
      Tawk_API.hideWidget();
    };
    var Tawk_LoadStart = new Date();
    (function () {
      var s1 = document.createElement("script"),
        s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/6a330a79b319cc1d4d432ae1/1jrbm1r7d';
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      s0.parentNode.insertBefore(s1, s0);
    })();
  `}
</Script>
<body>
  <body>
  <script dangerouslySetInnerHTML={{
    __html: `
      try {
        const dark = localStorage.getItem('darkMode');
        if (dark === 'true') {
          document.documentElement.classList.add('dark');
        }
      } catch(e) {}
    `
  }} />
  <FloatingChat />
  ...
</body>
  <FloatingChat />
  <Script id="tawk-to" strategy="afterInteractive">
    {`...`}
  </Script>
</body>
      </body>
    </html>
  );
}