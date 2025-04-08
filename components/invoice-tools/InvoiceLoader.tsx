import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import InvoiceTable from "./InvoiceTable";
import { useUser } from "@/hooks/UserContext";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import styles from "../../app/user/myinvoice/myinvoice.module.css";
import Cookies from "js-cookie";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function InvoiceLoader({customerId}:{customerId?:any}) {
  const { user } = useUser();
  const router = useRouter();
  const [invoiceItem, setInvoiceItem] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 1;

  const fetchInvoice = useCallback(async () => {
    if (!user?.user?._id) return;

    try {
      setIsLoading(true);
      if(customerId){
        const response =await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/${customerId}`)
        setInvoiceItem(response.data.invoices||[]); // Extract invoices from the response
        setTotalItems(response.data.invoices.length||0);
      }
      else{
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/userId/${user.user._id}`
      );
      setInvoiceItem(response.data || []);
      setTotalItems(response.data.length || 0);
    }
     
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.user?._id, setInvoiceItem,customerId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems, limit]);

  const paginatedData = invoiceItem.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const handleDelete = async (id: string) => {
    try {
      const accessToken = Cookies.get("accessToken");
        const headers = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        };
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${id}`,headers
      );
      fetchInvoice();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
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

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (startPage > 1) {
      pageNumbers.unshift(1, "...");
    }
    if (endPage < totalPages) {
      pageNumbers.push("...", totalPages);
    }

    return pageNumbers;
  };

  if (isLoading) {
    return <Spinner loading={isLoading} color="gray" />;
  }

  return (
    <>
      {paginatedData.length > 0 ? (
        <>
          <InvoiceTable
            invoiceItem={paginatedData}
            handleNavigation={(url: string) => router.push(url)}
            handleDelete={handleDelete}
            currentPage={currentPage}
            limit={limit}
            refreshData={fetchInvoice}
          />

          <div className={styles.paginationBox}>
            <div className={styles.LeftSide}>
              <div className={styles.totalpage}>
                Page {currentPage} of {totalPages}
              </div>

              <div className={styles.selectionLimit}>
                {/* <select
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  value={limit}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select> */}

                    <Select
                    value={String(limit)} // Ensure value is a string
                    onValueChange={(value) => {
                        setLimit(Number(value));
                        setCurrentPage(1);
                    }}
                    >
                <SelectTrigger>
                    <SelectValue placeholder="Select limit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                </SelectContent>
                </Select>

              </div>
            </div>

            <div className={styles.rightPage}>
              <Button
                className={styles.previous}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              {renderPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={index} className={styles.dots}>
                    ...
                  </span>
                ) : (
                  <button
                    key={index}
                    className={
                      currentPage === page ? styles.active : styles.pagenumber
                    }
                    onClick={() =>
                      typeof page === "number" && setCurrentPage(page)
                    }
                  >
                    {page}
                  </button>
                )
              )}
              <Button
                className={styles.nextbutton}
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => (p < totalPages ? p + 1 : p))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center py-8">No invoices found</p>
      )}
    </>
  );
}
