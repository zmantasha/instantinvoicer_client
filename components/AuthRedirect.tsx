"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Spinner from "./Spinner"; // Ensure the Spinner component is in your project

export default function AuthRedirect() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status from cookies
    const authStatus = Cookies.get("accessToken");
    setIsAuthenticated(!!authStatus); // Convert to boolean
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;
    
    const storedUser = localStorage.getItem("user");
    if (isAuthenticated && storedUser) {
      router.replace("/user/myinvoice");
    } else {
      localStorage.removeItem("user");
      router.replace("/account/login");
    }
  }, [isAuthenticated, router]);

  return (
    <main className="container mx-auto py-8 px-4">
      {isAuthenticated === null ? <Spinner loading={true} color="teal" /> : null}
    </main>
  );
}
