"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Get the 'isLoggedin' value from cookies and set authentication state
    const authStatus = Cookies.get('isLoggedin');
    console.log(authStatus)
    setIsAuthenticated(!!authStatus);  // Convert to boolean (true if logged in, false otherwise)
  }, []);

  useEffect(() => {
    // Redirect based on the authentication state
    if (isAuthenticated === null) return;  // Wait until the state is set
    if (isAuthenticated) {
      router.replace("/user/myinvoice");  // Redirect to /user/myinvoice if logged in
    } else {
      router.replace("/account/login");  // Redirect to /account/login if not logged in
    }
  }, [isAuthenticated, router]); // Re-run the effect when isAuthenticated changes

  return (
    <main className="container mx-auto py-8 px-4">
      {/* You can add a loading spinner here if necessary */}
      {isAuthenticated === null ? (
        <div>Loading...</div>  // Show loading text or a spinner
      ) : null}
    </main>
  );
}
