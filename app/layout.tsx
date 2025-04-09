"use client"; // This is a client component

import './globals.css';
import { Inter } from 'next/font/google';
import NavBar from '../components/navbar/index';
import { UserProvider } from "../hooks/UserContext";
import { ToastContainer } from "react-toastify";
import { useParams, usePathname } from "next/navigation";
import Footer from '@/components/footer/footer';
import {Toaster} from "react-hot-toast"
import styles from "../app/user/customer/[id]/customerDetails.module.css"
import CustomerList from '@/components/customer/CustomerList';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get the current path
  const {id}= useParams()
  // Hide NavBar for all dynamic `share` routes like `/share/:id`
  const shouldShowNavBar = !pathname.startsWith("/share/")&& !pathname.startsWith("/admin");
  // Hide footer for account pages and admin pages
  const shouldShowFooter = !pathname.startsWith("/account/") && !pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
        <Toaster/>
          {/* <ToastContainer /> */}
          {shouldShowNavBar && <NavBar />}
          <main>{children}</main>
          {shouldShowFooter && <Footer/>}
        </UserProvider>
      </body>
    </html>
  );
}
