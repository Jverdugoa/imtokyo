import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IMFTOK | Improving My Fashion Tokyo",
  description: "IMFTOK: Tu Asistente de Estilismo Personal y Guardarropa Inteligente inspirado en Tokio. Organiza tus prendas con fotos, descubre tu colorimetría y crea combinaciones de alto impacto.",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream-50 dark:bg-charcoal-950 text-charcoal-900 dark:text-zinc-100 selection:bg-terracotta-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
