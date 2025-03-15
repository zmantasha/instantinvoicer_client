// components/invoice-tools/InvoiceTable.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../../app/user/myinvoice/myinvoice.module.css";
import { FcPaid } from "react-icons/fc";
import { MdDelete, MdEdit } from "react-icons/md";
import { formatCurrency } from "../../lib/utils/format-currency";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export interface InvoiceItem {
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
      email?: string;
      address?: string;
    };
  };
  totals: {
    total: number;
    tax?: number;
    discount?: number;
  };
  status: "Paid" | "Pending" | "Draft";
  createdAt: string;
  updatedAt: string;
}

interface InvoiceTableProps {
  invoiceItems: InvoiceItem[];
  handleDelete: (id: string) => void;
  handleStatusChange: (id: string, currentStatus: string) => void;
}

export default function InvoiceTable({
  invoiceItems,
  handleDelete,
  handleStatusChange,
}: InvoiceTableProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const headers = [
    "Customer",
    "Reference",
    "Date",
    "Due Date",
    "Status",
    "Total",
    "Action",
  ];

  const toggleDropdown = (id: string) => {
    setShowDropdown((prevId) => (prevId === id ? null : id));
  };

  const handleEditInvoice = (id: string) => {
    router.push(`/user/editInvoice/${id}`);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(null);
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

  return (
    <div className={styles.tableContainer}>
      <table className={styles.invoiceTable}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoiceItems.map((item) => (
            <tr key={item._id}>
              <td>{item.recipientDetails.billTo.name}</td>
              <td>{item.invoiceDetails.number}</td>
              <td>
                {new Date(item.invoiceDetails.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </td>
              <td>
                {new Date(item.invoiceDetails.dueDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </td>
              <td>
                <span
                  className={`${styles.statusBadge} ${
                    styles[item.status.toLowerCase()]
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td>
                {formatCurrency(
                  item.totals.total,
                  item.invoiceDetails.currency
                )}
              </td>
              <td>
                <div className={styles.invoicedropdown}>
                  <button
                    className={styles.viewButton}
                    onClick={() => router.push(`/user/d/${item._id}`)}
                  >
                    View
                  </button>
                  <button
                    onClick={() => toggleDropdown(item._id)}
                    aria-label="More actions"
                  >
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  {showDropdown === item._id && (
                    <div ref={dropdownRef} className={styles.dropdownMenu}>
                      <div
                        className={styles.dropdownContent}
                        onClick={() => handleEditInvoice(item._id)}
                      >
                        <MdEdit size={20} />
                        Edit
                      </div>
                      <div
                        className={styles.dropdownContent}
                        onClick={() =>
                          handleStatusChange(item._id, item.status)
                        }
                      >
                        <FcPaid size={20} />
                        {item.status === "Paid"
                          ? "Mark as Pending"
                          : "Mark as Paid"}
                      </div>
                      <div
                        className={styles.dropdownContent}
                        onClick={() => setDeleteItemId(item._id)}
                      >
                        <MdDelete color="#e65050" size={20} />
                        Delete
                      </div>
                    </div>
                  )}
                  {deleteItemId === item._id && (
                    <div className={styles.popupOverlay}>
                      <div className={styles.popup}>
                        <h3>
                          Delete {item.recipientDetails.billTo.name}'s Invoice?
                        </h3>
                        <p>This action cannot be undone.</p>
                        <div className={styles.popupButtons}>
                          <button
                            className={styles.confirmButton}
                            onClick={() => {
                              handleDelete(item._id);
                              setDeleteItemId(null);
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={() => setDeleteItemId(null)}
                          >
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