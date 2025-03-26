"use client"

import InvoiceGenerator from "@/components/invoice/invoice-generator";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function NewInvoiceCustomer(){
  const { id } = useParams<{ id: string }>();
  console.log(id)
    // Memoize the invoiceId to prevent unnecessary recalculations
    const memoizedInvoiceId = useMemo(() => id, [id]);
        <>
       <InvoiceGenerator invoiceId={memoizedInvoiceId} />
        </>
}