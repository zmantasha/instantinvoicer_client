"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../../app/user/myinvoice/myinvoice.module.css";
import { FcPaid } from "react-icons/fc";
import { MdDelete, MdEdit } from "react-icons/md";
import { formatCurrency } from "../../lib/utils/format-currency";
import { useRouter } from "next/navigation";
import { BadgeInfo, ChevronDown, Delete, Edit } from "lucide-react";

interface InvoiceItem {
  _id: string;
  invoiceDetails: {
    number: string;
    date: string;
    dueDate: string;
    currency: string;
  };
  recipientDetails: {
    billTo: {
      name: string;
    };
  };
  totals: {
    total: number;
  };
  status: string;
}

interface InvoiceTableProps {
  invoiceItem: InvoiceItem[];
  handleNavigation: (path: string) => void;
  handleDelete: (id: string) => void;
}

export default function InvoiceTable({
  invoiceItem,
  handleNavigation,
  handleDelete,
}: InvoiceTableProps) {
  const headers = ["Customer", "Reference", "Date", "Due Date", "Status", "Total", "Action"];
  
  // Initialize invoices with the prop value instead of null
  const [invoices, setInvoices] = useState<InvoiceItem[]>(invoiceItem);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const router = useRouter();

  // Ref for dropdown
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = (id: string) => {
    setShowDropdown((prevId) => (prevId === id ? null : id));
  };

  const confirmDelete = () => {
    if (deleteItemId) {
      handleDelete(deleteItemId);
      setDeleteItemId(null); // Reset after deletion
    }
  };

  const handleCancelDelete = () => {
    setDeleteItemId(null); // Cancel deletion
  };

  const handleEditInvoice = (id: string) => {
    router.push(`/user/editInvoice/${id}`);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(null); // Close dropdown if clicked outside
    }
  };

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Paid" ? "Pending" : "Paid";

    // Find the specific invoice to get the correct total amount
    const invoice = invoices.find((inv) => inv._id === id);
    if (!invoice) return;

    const { total } = invoice.totals;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          total,
          amountPaid: newStatus === "Paid" ? total : 0,
          balanceDue: newStatus === "Paid" ? 0 : total,
        }),
      });

      if (response.ok) {
        setInvoices((prevInvoices) =>
          prevInvoices.map((inv) =>
            inv._id === id
              ? { ...inv, status: newStatus, totals: { ...inv.totals, amountPaid: newStatus === "Paid" ? total : 0, balanceDue: newStatus === "Paid" ? 0 : total } }
              : inv
          )
        );
      } else {
        console.error("Failed to update invoice status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.invoiceTable}>
        <thead>
          <tr>
            {headers.map((item, i) => (
              <th key={i}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((item) => (
            <tr key={item._id}>
              <td>{item?.recipientDetails.billTo.name}</td>
              <td>{item.invoiceDetails.number}</td>
              <td>{new Date(item.invoiceDetails.date).toLocaleDateString()}</td>
              <td>{new Date(item.invoiceDetails.dueDate).toLocaleDateString()}</td>
              <td>{item.status || "Pending"}</td>
              <td>{formatCurrency(item.totals.total, item.invoiceDetails.currency)}</td>
              <td>
                <div className={styles.invoicedropdown}>
                  <button className={styles.viewButton} onClick={() => handleNavigation(`/user/d/${item._id}`)}>
                    View
                  </button>
                  <div onClick={() => toggleDropdown(item._id)}><ChevronDown className="w-4 h-4 ml-2" /></div>
                  {showDropdown === item._id && (
                    <div ref={dropdownRef} className={styles.dropdownMenu}>
                      <div className={styles.dropdownContent} onClick={() => handleEditInvoice(item._id)}>
                      <Edit className="w-4 h-4 mr-2"  />
                        Edit
                      </div>
                      <div className={styles.dropdownContent} onClick={() => handleStatusChange(item._id, item.status)}>
                      <BadgeInfo className="w-4 h-4 mr-2 text-green-700"    />
                        {item.status === "Paid" ? "Mark as Not Paid" : "Mark as Paid"}
                      </div>
                      <div onClick={() => setDeleteItemId(item._id)} className={styles.dropdownContent}>
                      <Delete className="w-4 h-4 mr-2 text-red-500"  />
                        Delete
                      </div>
                    </div>
                  )}
                  {deleteItemId === item._id && (
                    <div className={styles.popupOverlay}>
                      <div className={styles.popup}>
                        <h3>
                          Are you sure you want to delete {item?.recipientDetails.billTo.name}'s invoice?
                        </h3>
                        <div className={styles.popupButtons}>
                          <button className={styles.confirmButton} onClick={confirmDelete}>
                            Confirm
                          </button>
                          <button className={styles.cancelButton} onClick={handleCancelDelete}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
