"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./myinvoice.module.css";
import InvoiceTable from "../../../components/invoicee/InvoiceTable";
import axios from "axios";
import { useUser } from "../../../hooks/UserContext";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";

export default function MyInvoice() {
  const { user } = useUser();
  const [invoiceItem, setInvoiceItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch invoices for the logged-in user
  const fetchInvoice = useCallback(async () => {
    if (!user?.user._id) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/userId/${user.user._id}`
      );
      setInvoiceItem(response.data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.user._id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  // Navigation function
  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  // Navigate to the invoice template page
  const handleNewInvoice = useCallback(() => {
    router.push('/user/invoicetamplate');
  }, [router]);

  // Handle deletion of an invoice
  const handleDelete = useCallback(async (id: string) => {
    try {
      // Delete the invoice on the backend
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${id}`);
      // if (response.status === 200) {
      //   console.log("Invoice deleted successfully");
      // } else {
      //   console.error("Failed to delete invoice");
      // }
      // Re-fetch the invoices to ensure the state is updated with the latest data
      fetchInvoice();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  }, [fetchInvoice]);

  // Show loading spinner while data is fetching
  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.myInvoicePage}>
      <div className={styles.myInvoiceContainer}>
        <div className={styles.invoiceCard}>
          <div className={styles.invoiceHeader}>
            <h2 className={styles.invoiceTitle}>My Invoices</h2>
             <Button variant="outline"  className="text-white bg-[#0c69cc] hover:bg-[#0f7fe6] hover:text-white"  onClick={handleNewInvoice}>
            New Invoice 
            </Button>
          </div>
          <div className={styles.invoiceContainer}>
            {invoiceItem && invoiceItem.length > 0 ? (
              <InvoiceTable
                invoiceItem={invoiceItem}
                handleNavigation={handleNavigation}
                handleDelete={handleDelete}
              />
            ) : (
              <p className={styles.noInvoiceFound}>No Invoice found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
