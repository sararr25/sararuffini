import "./globals.css";
import "../styles/shared-nav-footer.css";
import "../styles/mobile.css";

export const metadata = {
  metadataBase: new URL("https://www.sararuffini.com"),
  title: "Sara Ruffini",
  description: "Video editor and content creator portfolio.",
  icons: {
    icon: "/assets/stitch-homepage-featured/sticker-pixel-perfect.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Architects+Daughter&family=Be+Vietnam+Pro:wght@400;500;700;800&family=DM+Sans:opsz,wght@9..40,400;500;700&family=Epilogue:wght@400;600;700;800;900&family=Hanken+Grotesk:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800;900&family=Permanent+Marker&family=Reenie+Beanie&family=Rock+Salt&family=Sora:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700;800&family=Spline+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
