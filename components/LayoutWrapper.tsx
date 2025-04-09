"use client";

import { useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import NavBar from "./navbar";
import Footer from "./footer/footer";
import CustomerList from "./customer/CustomerList";
import styles from "@/app/user/customer/[id]/customerDetails.module.css";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { id } = useParams();

  const shouldShowNavBar = !pathname.startsWith("/share/") && !pathname.startsWith("/admin");
  const shouldShowFooter = !pathname.startsWith("/account/") && !pathname.startsWith("/admin");
  const customerListSidebar =
    pathname.includes(`/customer/${id}`) && !pathname.endsWith(`/customer/${id}/edit`);

  useEffect(() => {
    // Inject Tawk.to script on client-side only
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://embed.tawk.to/67f62de867875419109a295f/1iocq6m4n";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.body.appendChild(s1);
  }, []);

  return (
    <>
      {shouldShowNavBar && <NavBar />}
      {customerListSidebar ? (
        <div className={styles.container}>
          <aside className={styles.customerList}>
            <CustomerList />
          </aside>
          <main>{children}</main>
        </div>
      ) : (
        <main>{children}</main>
      )}
      {shouldShowFooter && <Footer />}
    </>
  );
};

export default LayoutWrapper;
