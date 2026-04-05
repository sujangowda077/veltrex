import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ChatBot from "@/app/components/ChatBot";
import logo from "@/app/assets/logo1.png";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://veltrex.co.in"),
  title: "Veltrex.Devs | Student-Built Tech Studio",
  description:
    "We build real-world products — AI tools, web apps, and campus systems — focused on solving actual problems.",
  icons : {
    icon: "/assets/logo1.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatBot />
      </body>
    </html>
  );
}