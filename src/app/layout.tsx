import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EventProvider } from "@/context/EventContext";
import MainLayout from "@/components/MainLayout";

import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event Set - Gestão de Eventos",
  description: "Sistema de gestão de eventos e convidados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <EventProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </EventProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
