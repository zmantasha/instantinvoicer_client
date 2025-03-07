// components/invoice-tools/PaginationControls.tsx
"use client";

import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import styles from "../../app/user/myinvoice/myinvoice.module.css";

interface PaginationControlsProps {
  totalPages: number;
  totalItems: number;
  currentPage: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function PaginationControls({
  totalPages,
  totalItems,
  currentPage,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationControlsProps) {
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

    if (startPage > 1) pageNumbers.unshift(1, "...");
    if (endPage < totalPages) pageNumbers.push("...", totalPages);

    return pageNumbers;
  };

  return (
    <div className={styles.paginationBox}>
      <div className={styles.LeftSide}>
        <div className={styles.totalpage}>
          Page {currentPage} of {totalPages}
        </div>
        <div className={styles.selectionLimit}>
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              onLimitChange(Number(value));
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
          onClick={() => onPageChange(currentPage - 1)}
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
              className={currentPage === page ? styles.active : styles.pagenumber}
              onClick={() => typeof page === "number" && onPageChange(page)}
            >
              {page}
            </button>
          )
        )}
        <Button
          className={styles.nextbutton}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}