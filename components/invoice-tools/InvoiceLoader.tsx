// components/invoice-tools/InvoiceLoader.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import InvoiceTable from "./InvoiceTable";
import { PaginationControls } from "./PaginationControls";
import styles from "../../app/user/myinvoice/myinvoice.module.css";
import FilterComponent from "./FilterComponent";

interface InvoiceLoaderProps {
  initialInvoices: any[];
}

export default function InvoiceLoader({ initialInvoices }: InvoiceLoaderProps) {
  const router = useRouter();
  const [invoiceItems, setInvoiceItems] = useState(initialInvoices);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [amountRange, setAmountRange] = useState<{ min?: number; max?: number }>({});

  // Sync with server data
  useEffect(() => {
    setInvoiceItems(initialInvoices);
  }, [initialInvoices]);


   // Memoized filtered invoices
   const filteredInvoices = useMemo(() => {
    return initialInvoices.filter(invoice => {
      // Main search filter
      const matchesSearch = () => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        
        switch (selectedFilter) {
          case 'name':
            return invoice.recipientDetails.billTo.name.toLowerCase().includes(query);
          case 'status':
            return invoice.status.toLowerCase().includes(query);
          case 'dueDate':
            return new Date(invoice.invoiceDetails.dueDate).toLocaleDateString().includes(query);
          case 'date':
            return new Date(invoice.invoiceDetails.date).toLocaleDateString().includes(query);
          case 'currency':
            return invoice.invoiceDetails.currency.toLowerCase().includes(query);
          case 'all':
          default:
            return (
              invoice.recipientDetails.billTo.name.toLowerCase().includes(query) ||
              invoice.invoiceDetails.number.toLowerCase().includes(query) ||
              invoice.status.toLowerCase().includes(query)
            );
        }
      };

      // Advanced filters
      const matchesStatus = !statusFilter || invoice.status.toLowerCase() === statusFilter.toLowerCase();
      
      const invoiceDate = new Date(invoice.invoiceDetails.date);
      const matchesDate = (!dateRange.start || invoiceDate >= dateRange.start) &&
                         (!dateRange.end || invoiceDate <= dateRange.end);
      
      const matchesCurrency = !currencyFilter || 
        invoice.invoiceDetails.currency.toLowerCase() === currencyFilter.toLowerCase();
      
      const matchesAmount = (!amountRange.min || invoice.totals.total >= amountRange.min) &&
                           (!amountRange.max || invoice.totals.total <= amountRange.max);

      return (
        matchesSearch() &&
        matchesStatus &&
        matchesDate &&
        matchesCurrency &&
        matchesAmount
      );
    });
  }, [
    initialInvoices, 
    searchQuery, 
    selectedFilter,
    statusFilter,
    dateRange,
    currencyFilter,
    amountRange
  ]);
// Pagination calculations using filteredInvoices
const totalItems = filteredInvoices.length;
const totalPages = Math.ceil(totalItems / limit);
const paginatedData = filteredInvoices.slice(
  (currentPage - 1) * limit,
  currentPage * limit
);
  const handleDelete = async (id: string) => {
    const previousItems = [...invoiceItems];
    
    // Optimistic update
    const updatedItems = previousItems.filter(item => item._id !== id);
    setInvoiceItems(updatedItems);

    // Adjust page if needed
    const newTotalPages = Math.ceil(updatedItems.length / limit);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(1, newTotalPages));
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (error) {
      console.error("Delete failed:", error);
      setInvoiceItems(previousItems);
      setCurrentPage(currentPage);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const previousItems = [...invoiceItems];
    const newStatus = currentStatus === "Paid" ? "Pending" : "Paid";
  
    // Find the invoice item
    const invoiceItem = previousItems.find(item => item._id === id);
    if (!invoiceItem || !invoiceItem.totals) {
      console.error("Invoice item not found or missing totals:", invoiceItem);
      return; // Exit the function if item is not found
    }
  
    // Optimistic update
    const updatedItems = previousItems.map(item =>
      item._id === id ? { ...item, status: newStatus } : item
    );
    setInvoiceItems(updatedItems);
  
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            total: invoiceItem.totals?.total || 0, // Ensure totals exists
            amountPaid: newStatus === "Paid" ? invoiceItem.totals?.total || 0 : 0,
            balanceDue: newStatus === "Paid" ? 0 : invoiceItem.totals?.total || 0
          }),
        }
      );
      if (!response.ok) throw new Error("Status update failed");
      router.refresh();
    } catch (error) {
      console.error("Status update failed:", error);
      setInvoiceItems(previousItems);
    }
  };
  
    // Add clear filters function
    const clearFilters = useCallback(() => {
      setSearchQuery("");
      setStatusFilter("");
      setDateRange({});
      setCurrencyFilter("");
      setAmountRange({});
    }, []);

  return (
    <>
     <FilterComponent
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={statusFilter}
        setSelectedStatus={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedCurrency={currencyFilter}
        setSelectedCurrency={setCurrencyFilter}
        amountRange={amountRange}
        setAmountRange={setAmountRange}
        clearFilters={clearFilters}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
      />

      {invoiceItems.length > 0 ? (
        <>
          <InvoiceTable
            invoiceItems={paginatedData}
            handleDelete={handleDelete}
            handleStatusChange={handleStatusChange}
          />
          <PaginationControls
            totalPages={totalPages}
            totalItems={totalItems}
            currentPage={currentPage}
            limit={limit}
            onPageChange={setCurrentPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setCurrentPage(1);
            }}
          />
        </>
      ) : (
        <p className="text-center py-8">No invoices found</p>
      )}
    </>
  );
}