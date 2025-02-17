"use client";
import { useParams, useRouter } from "next/navigation";
import styles from "./view.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { BadgeInfo, BookMarked, Calendar, ChevronDown, Delete, Dot, Edit, User } from "lucide-react";
import InvoiceGenerator from "../../../components/invoice-tools/invoiceGenerator";
import PDFGenerator from "../../../components/invoice-tools/PDFGenerator";
import { useUser } from "../../../hooks/UserContext";
import { formatCurrency } from "../../../lib/utils/format-currency";
import Spinner from "../../../components/Spinner";

export default function SharePage() {
  const { user } = useUser();
  const [invoiceItem, setInvoiceItem] = useState<any>(null); // Initialize state for invoice data
  const { id } = useParams();
  
  // const fetchInvoice = async () => {
  //   try {
  //     const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${id}`);
  //     console.log(response); // Log the entire response for debugging
  //     const data = response.data;
  //     console.log(data); // Log the data to check its structure
  //     setInvoiceItem(data); // Set the invoice data to state
  //   } catch (error) {
  //     console.log(error); // Log any error that occurs during the fetch
  //   }
  // };
    const fetchInvoice = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${id}`
      );
      const data = response.data;
      setInvoiceItem(data);
    } catch (error) {
      console.log(error);
    }
  };

  
  useEffect(() => {
    if (id) {
      fetchInvoice(); // Fetch the invoice when the component mounts or when `id` changes
    } else {
      console.error("ID is undefined");
    }
  }, [id]);

  // If invoiceItem is null, show loading message
  if (!invoiceItem) {
    return <Spinner loading={true} color="teal" />;
  }

  return (
    <div className={styles.viewPage}>
      <div className={styles.viewContainer}>
        <div className={styles.viewCard}>
          {/* View Invoice Header */}
          <div className={styles.viewHeader}>
            {invoiceItem.invoiceDetails && (
              <div className={styles.headerTop}>
                <h1>{invoiceItem.invoiceDetails.number} from {invoiceItem.recipientDetails.billTo.name}</h1>
              
              </div>
            )}
          </div>
          <div className={styles.middle}>
          <p>
              DueDate: 
                  <span>
                     <Calendar className="w-4 h-4 mr-1" />
                    {new Date(invoiceItem.invoiceDetails.date).toLocaleDateString()}
                  </span>
                  {invoiceItem.status === "Paid" && (
                    <span className="text-blue-700 font-bold">
                      <Dot className="w-6 h-4 mr-1 font-bold text-blue-700" />
                      {invoiceItem.status}
                    </span>
                  )}
                </p>
                <p>
                  <span>
              {invoiceItem.invoiceDetails.currency} {formatCurrency(
                        invoiceItem.totals.total,
                        invoiceItem.invoiceDetails.currency
                      )}
                  </span>
                  </p>
          </div>

            <div className={styles.headerButtons}>
                 <PDFGenerator
                    invoiceData={invoiceItem}
                    fileName={invoiceItem?.invoiceDetails?.number || "invoice"}
                  />
            </div>
          {/* View Invoice/ Main Section */}
          <hr />
          <div id="invoice">
            <InvoiceGenerator invoiceItem={invoiceItem} />
          </div>
        </div>
      </div>
    </div>
  );
}
