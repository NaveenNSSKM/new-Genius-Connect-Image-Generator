import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "GeniusConnects Image Generator",
  description: "Extract person cutouts from photos and generate joining/announcement cards.",
  icons: {
    icon: "https://geniusconnects.com/assets/images/logo.png",
    shortcut: "https://geniusconnects.com/assets/images/logo.png",
    apple: "https://geniusconnects.com/assets/images/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lexendDeca.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://geniusconnects.com/assets/images/logo.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Inter:wght@600&family=Lexend+Deca:wght@600&family=Montserrat:wght@600&family=Outfit:wght@600&family=Playfair+Display:wght@600&family=Plus+Jakarta+Sans:wght@600&family=Poppins:wght@600&family=Space+Grotesk:wght@600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${lexendDeca.className} min-h-full flex flex-col`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
