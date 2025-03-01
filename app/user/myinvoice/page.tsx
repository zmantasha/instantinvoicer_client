"use client";

import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import styles from "./myinvoice.module.css";
import FilterComponent from "@/components/invoice-tools/FilterComponent";
import InvoiceLoader from "@/components/invoice-tools/InvoiceLoader";

export default function MyInvoice() {
  const router = useRouter();

  const handleNewInvoice = () => {
    router.push("/user/invoicetamplate");
  };

  return (
    <div className={styles.myInvoicePage}>
      <div className={styles.myInvoiceContainer}>
        <div className={styles.invoiceCard}>
          <div className={styles.invoiceHeader}>
            <h2 className={styles.invoiceTitle}>My Invoices</h2>
            <Button
              variant="outline"
              className="text-white bg-[#0c69cc] hover:bg-[#0f7fe6] hover:text-white"
              onClick={handleNewInvoice}
            >
              New Invoice
            </Button>
          </div>
          <div>
            {/* <FilterComponent /> */}
          </div>
          <div className={styles.invoiceContainer}>
            <InvoiceLoader />
          </div>
        </div>
      </div>
    </div>
  );
}
