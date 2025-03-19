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
    // Redirect based on authentication state
    if (isAuthenticated === null) return; // Wait until authentication is checked
    if (isAuthenticated) {
      router.replace("/user/myinvoice"); // Redirect to the dashboard if logged in
    } else {
      router.replace("/account/login"); // Redirect to login page
    }
  }, [isAuthenticated, router]);

  return (
    <main className="container mx-auto py-8 px-4">
      {isAuthenticated === null ? <Spinner loading={true} color="gray" /> : null}
    </main>
  );
}
