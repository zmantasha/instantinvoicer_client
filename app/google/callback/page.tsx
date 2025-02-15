"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token in a cookie (valid for 1 day)
     Cookies.set("accessToken", token, { 
    expires: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour from now
    path: "/", 
    secure: true, 
    sameSite: "None" 
  });

      // Redirect smoothly without full reload
      router.replace("/user/myinvoice");
    } else {
      router.replace("/account/login");
    }
  }, [searchParams, router]);

  return <p>Processing Google login...</p>;
}
