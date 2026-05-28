import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Ajo - Save Together, Grow Together",
  description: "Nigeria's premier digital savings circle platform. Join trusted ajo groups, save together and receive secure payouts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}