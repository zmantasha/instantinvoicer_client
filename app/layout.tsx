// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { UserProvider } from "../hooks/UserContext";
import { Toaster } from "react-hot-toast";

import { getServerSideUserData } from '@/components/invoice-tools/getServerSideUserData';
import ClientLayout from '@/components/invoice-tools/ClientLayout';
import AuthHandler from '@/components/invoice-tools/AuthHandler';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getServerSideUserData();

  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider serverUser={userData}>
          <Toaster/>
           <AuthHandler />
          <ClientLayout>
            {children}
          </ClientLayout>
        </UserProvider>
      </body>
    </html>
  );
}