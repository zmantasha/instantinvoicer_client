"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./myinvoice.module.css";

import axios from "axios";
import { useUser } from "../../../hooks/UserContext";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import Spinner from "@/components/Spinner";
import InvoiceTable from "../../../components/invoice-tools/InvoiceTable";

export default function MyInvoice() {
  const { user } = useUser();
  const [invoiceItem, setInvoiceItem] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  
  // const totalPages = invoiceItem.length ? Math.ceil(invoiceItem.length / limit) : 1;
  const totalPages = Math.ceil(invoiceItem.length / Number(limit));
 
  // Fetch invoices for the logged-in user
  const fetchInvoice = useCallback(async () => {
    if (!user?.user?._id) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/userId/${user.user._id}`
      );
      setInvoiceItem(response.data || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.user?._id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleNewInvoice = () => {
    router.push("/user/invoicetamplate");
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${id}`);
      fetchInvoice();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  };

  if (isLoading) {
    return <Spinner loading={isLoading} color="teal" />;
  }

 

// In renderPageNumbers function:
const renderPageNumbers = () => {
  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage, endPage;

  if (totalPages <= maxPagesToShow) {
    startPage = 1;
    endPage = totalPages;
  } else {
    const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
    
    if (currentPage <= maxPagesBeforeCurrent) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - maxPagesBeforeCurrent;
      endPage = currentPage + maxPagesAfterCurrent;
    }
  }

  // Add page numbers
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Add ellipses if needed
  if (startPage > 1) {
    pageNumbers.unshift(1, '...');
  }
  if (endPage < totalPages) {
    pageNumbers.push('...', totalPages);
  }

  return pageNumbers;
};

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
            {invoiceItem.length > 0 ? (
              <InvoiceTable
            invoiceItem={invoiceItem} // Pass paginated data
            handleNavigation={router.push}
            handleDelete={handleDelete}
            currentPage={currentPage}
            limit={limit}
          />
            ) : (
              <p className={styles.noInvoiceFound}>No Invoice found</p>
            )}
          

                      {/* Pagination */}
              <div className={styles.paginationBox}>
                <div className={styles.totalpage}>
                  Page {currentPage} of {totalPages}
                </div>
                <div className={styles.rightSide}>
                  <div className={styles.selectionLimit}>
                    <select 
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setCurrentPage(1); // Reset to first page when changing limit
                      }} 
                      value={limit}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                    </select>
                  </div>
                  <div className={styles.rightPage}>
                    <Button
                      className={styles.previous}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    {renderPageNumbers().map((page, index) =>
                      page === "..." ? (
                        <span key={index} className={styles.dots}>...</span>
                      ) : (
                        <button
                          key={index}
                          className={currentPage === page ? styles.active : styles.pagenumber}
                          onClick={() => setCurrentPage(page as any)}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <Button
                      className={styles.nextbutton}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
        </div>
      </div>
    </div>
    </div>
  );
}
