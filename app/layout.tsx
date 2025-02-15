"use client"; // This is a client component

import './globals.css';
import { Inter } from 'next/font/google';
import NavBar from '../components/navbar/index';
import { UserProvider } from "../hooks/UserContext";
import { ToastContainer } from "react-toastify";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get the current path

  // Hide NavBar for all dynamic `share` routes like `/share/:id`
  const shouldShowNavBar = !pathname.startsWith("/share/");

  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <ToastContainer />
          {shouldShowNavBar && <NavBar />}
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
