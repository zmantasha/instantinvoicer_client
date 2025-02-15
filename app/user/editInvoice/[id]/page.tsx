"use client"
import InvoiceGenerator from "../../../../components/invoice/invoice-generator";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function EditInvoice(){
    const { id } = useParams<{ id: string }>();

    // Memoize the invoiceId to prevent unnecessary recalculations
    const memoizedInvoiceId = useMemo(() => id, [id]);

    return (
        <>
       <InvoiceGenerator invoiceId={memoizedInvoiceId} />
        </>
    )
}
