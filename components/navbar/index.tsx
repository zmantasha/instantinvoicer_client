// components/NavBar.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./navbar.module.css";
import { useUser } from "../../hooks/UserContext";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

// the axios interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      Cookies.remove("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/account/login";
    }
    return Promise.reject(error);
  }
);

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, clearUser } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize user data on mount
  useEffect(() => {
    const validateSession = async () => {
      const token = Cookies.get("accessToken");
      const storedUser = localStorage.getItem("user");
      
      if (token && storedUser) {
        try {
          // Verify token validity
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Update user context with fresh data
          setUser(response.data.user);
          console.log(response.data.user);
          // localStorage.setItem("user", JSON.stringify(response.data.user));
        } catch (error) {
          // Clear invalid session
          Cookies.remove("accessToken");
          localStorage.removeItem("user");
          clearUser();
          router.replace("/account/login");
        }
      }
    };

    validateSession();
  }, []);

  const handleLogout = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) return;

      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/logout`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Clear all user data
      Cookies.remove("accessToken");
      localStorage.removeItem("user");
      clearUser();
      setShowDropdown(false)
      setShowMobileMenu(false)
      router.replace("/account/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.navContent}>
        <div className={styles.leftContainer}>
          <Link href={user ? "/user/myinvoice" : "/"} className={styles.logo}>
            instantinvoicer.com
          </Link>

          {user && (
            <div className={`${styles.menuContainer} ${showMobileMenu ? styles.showMobileMenu : ""}`}>
              <ul className={styles.menuList}>
                <li className={styles.menuItem}>
                  <Link
                    href="/user/myinvoice"
                    className={`${styles.link} ${pathname === "/user/myinvoice" ? styles.active : ""}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Invoices
                  </Link>
                </li>
              </ul>

              <div className={styles.mobileAuth}>
                <div className={styles.dropdownContainer}>
                  <button 
                    className={styles.linkProfile} 
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-expanded={showDropdown}
                    aria-label="User menu"
                  >
                    {`${user?.firstName} ${user?.lastName}`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  
                  {showDropdown && (
                    <div ref={dropdownRef} className={styles.dropdownMenu}>
                      <div className={styles.dropdownProfile}>
                        <Image 
                          src={user.avatar || "/default.avif"} 
                          alt="Profile" 
                          width={50} 
                          height={50} 
                          className={styles.profileImage}
                        />
                        <div>
                          <p className={styles.dropdownProfileName}>{user.firstName}</p>
                          <p className={styles.dropdownProfileEmail}>{user.email}</p>
                        </div>
                      </div>
                      <Link href="/user/myaccount" className={styles.dropdownItem}>
                        Account Settings
                      </Link>
                      <button onClick={handleLogout} className={styles.dropdownItem}>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {user && (
          <button 
            className={styles.hamburger} 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle mobile menu"
          >
            <Menu size={24} />
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;