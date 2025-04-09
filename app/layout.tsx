"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "../components/navbar/index";
import { UserProvider } from "../hooks/UserContext";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/footer/footer";
import LayoutWrapper from "../components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <Toaster />
          <LayoutWrapper>{children}</LayoutWrapper>
          {/* Chat Widget added via client-side script */}
        </UserProvider>
      </body>
    </html>
  );
}
