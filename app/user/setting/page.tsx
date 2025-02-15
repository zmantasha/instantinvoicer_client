"use client"
import { useRouter } from "next/navigation";
import styles from "./setting.module.css"
import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useUser } from "../../../hooks/UserContext";
import axios from "axios";

export default function Setting(){
  const { user } = useUser();
    const router = useRouter();
    const [latestInvoiceNumber, setLatestInvoiceNumber] = useState<string>("INV-0001");
    useEffect(()=>{
      if (user?.user._id) {
        generateInvoiceNumber();
      }
    },[user])
    const generateInvoiceNumber = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8002/api/v1/invoice/invoices/userId/${user?.user._id}`
        );
        const invoices = response.data; // Assuming this is an array
        console.log(invoices);
    
        let newInvoiceNumber = "INV-0001";  // Default if no previous invoice exists
    
        if (invoices && invoices.length > 0) {
          const latestInvoice = invoices[invoices.length - 1]; // Get the last invoice
          console.log(latestInvoice);
    
          if (latestInvoice.invoiceDetails?.number) {
             
            const lastNumber = parseInt(
              latestInvoice.invoiceDetails.number.replace("INV-", ""), // Remove prefix
              10
            );
            newInvoiceNumber = `INV-${String(lastNumber + 1).padStart(4, "0")}`;
           
          }
        }
       setLatestInvoiceNumber(newInvoiceNumber)
       
      } catch (error) {
        console.log("Error fetching invoices:", error);
      }
    };
    
    const handleNavigation = (path: string) => {
        router.push(path);
      };
    return (
        <>
        <div className={styles.settingPage}>
            <div className={styles.settingContainer}>
      <div className={styles.settingCard}>
        <h2 className={styles.settingTitle}>Setting</h2>
        <p className={styles.settingContent}>
        Manage your settings here, including how you want to get paid.
        </p>
        <div className={styles.settingDetails}>
              <p>
                Invoice Settings:{" "}
                <span className={styles.InvoiceNumber}>
                Next Invoice Number: {latestInvoiceNumber}
                <FaEdit  color="green" onClick={() => handleNavigation('/user/setting/edit')}/>
                </span>
              </p>
            </div>
        </div>
        </div>
        </div>
        </>
    )
}