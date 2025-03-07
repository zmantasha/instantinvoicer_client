"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "../navbar/index";
import Footer from "../footer/footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in by reading localStorage
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user); // Convert to boolean (true if user exists, false otherwise)
  }, []);

  const shouldShowNavBar = !isLoggedIn && !pathname.startsWith("/share/") && !pathname.startsWith("/account/");
  const shouldShowFooter = !pathname.startsWith("/account/");

  return (
    <>
      {shouldShowNavBar && <NavBar />}
      <main>{children}</main>
      {shouldShowFooter && <Footer />}
    </>
  );
}
