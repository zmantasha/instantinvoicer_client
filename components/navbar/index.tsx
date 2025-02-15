"use client";

import Link from "next/link";
import { FC, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./navbar.module.css";
import { useUser } from "../../hooks/UserContext";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";

const NavBar: FC = () => {
  const [isLoggedin, setIsLoggedin] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, fetchUserProfile } = useUser();
  const dropdownRef = useRef<HTMLDivElement | null>(null);  // Type ref here
  const checkLoginStatus = () => {
    const isloggedinCookie = Cookies.get("accessToken");
    // const isloggedinCookie= localStorage.getItem("accessToken")
    setIsLoggedin(isloggedinCookie || null);
  };

  useEffect(() => {
    checkLoginStatus();

    if (isLoggedin) {
      fetchUserProfile();
    }

    const interval = setInterval(() => {
      checkLoginStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedin]);

  const handleLogout = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
  
      if (!accessToken) {
        toast.warn("You are not logged in.", { position: "bottom-right" });
        router.replace("/account/login");
        return;
      }
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
  
      if (response.data && response.data.status === "success") {
        Cookies.remove("accessToken");
        toast.success("Successfully logged out.", { position: "bottom-right" });
        router.replace("/account/login");
        setShowDropdown(null);
        setShowMobileMenu(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong while logging out.", { position: "bottom-right" });
    }
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => (prev ? null : "dropdown"));
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowDropdown(null);  // Close dropdown when mobile menu is opened
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    
    setShowDropdown(null);
    setShowMobileMenu(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(null); // Close dropdown if clicked outside
    }
  };

  // Attach event listener when dropdown is open
  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <div className={styles.leftContainer}>
          <h3 className={styles.logo} onClick={() => handleNavigation("/user/myinvoice")}>instantinvoicer.com</h3>

          <div
            className={`${styles.menuContainer} ${
              showMobileMenu ? styles.showMobileMenu : ""
            }`}
          >
            {isLoggedin ? (
              <ul className={styles.menuList}>
                <li className={styles.menuItem}>
                  <Link
                    href="/user/myinvoice"
                    className={`${styles.link} ${
                      pathname === "/user/myinvoice" ? styles.active : ""
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Invoices
                  </Link>
                </li>
                {/* <li className={styles.menuItem}>
                  <Link
                    href="/user/setting"
                    className={`${styles.link} ${
                      pathname === "/user/setting" ? styles.active : ""
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Setting
                  </Link>
                </li>
                <li className={styles.menuItem}>
                  <Button href="/user/upgrade" onClick={() => setShowMobileMenu(false)}>
                    Upgrade
                  </Button>
                </li> */}
              </ul>
            ) : (
              <ul className={styles.menuList}>
                {/* <li className={styles.menuItem}>
                  <Link
                    href="/help"
                    className={styles.link}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Help
                  </Link>
                </li> */}
                {/* <li className={styles.menuItem}>
                  <Link
                    href="/history"
                    className={styles.link}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    History
                  </Link>
                </li> */}
                {/* <li className={styles.menuItem}>
                  <Link
                    href="/guide"
                    className={styles.link}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Invoicing Guide
                  </Link>
                </li> */}
              </ul>
            )}

            <div className={styles.mobileAuth}>
              {isLoggedin && (
                <div className={styles.dropdownContainer}>
                  <div  className={styles.linkProfile}>
                    {user?.user ? `${user?.user?.firstName} ${user?.user?.lastName}` : <></>}
                    <ChevronDown className="w-4 h-4 ml-2" onClick={toggleDropdown} />
                  </div>
                  {showDropdown && (
                    <div ref={dropdownRef} className={styles.dropdownMenu}>
                      <div className={styles.dropdownProfile}>
                        <div className={styles.avatar}>{user?.user?.avatar ?<Image src={user?.user?.avatar } alt="Profile" width={50} height={50} className={styles.profileImage} />:<Image src={"/default.avif" } alt="Profile" width={50} height={50} className={styles.profileImage} />}</div>
                        <div>
                          <p className={styles.dropdownProfileName}>
                            {user && user?.user?.firstName}
                          </p>
                          <p className={styles.dropdownProfileEmail}>
                            {user && user?.user?.email}
                          </p>
                        </div>
                      </div>
                      <div
                        className={styles.dropdownItem}
                        onClick={() => handleNavigation("/user/myaccount")}
                      >
                        My Account
                      </div>
                      <div onClick={handleLogout} className={styles.dropdownItem}>
                        Sign Out
                      </div>
                    </div>
                  )}
                </div>
              ) 
              //  (
              //   <>
              //   </>
              //   // <div className={styles.authButtons}>
              //   //   <Button href="/account/login" onClick={() => setShowMobileMenu(false)}>
              //   //     Login
              //   //   </Button>
              //   //   <Button href="/account/signup" onClick={() => setShowMobileMenu(false)}>
              //   //     Signup
              //   //   </Button>
              //   // </div>
              // )
              }
            </div>
          </div>
        </div>

          {isLoggedin && <button className={styles.hamburger} onClick={toggleMobileMenu} aria-label="Toggle menu">
          <Menu size={24} />
        </button>
          }
      </div>
    </nav>
  );
};

export default NavBar;
