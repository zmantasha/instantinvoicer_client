"use client";

import InvoiceGenerator from "@/components/invoice/invoice-generator";
import { useParams, usePathname } from "next/navigation";

export default function NewInvoiceCustomer() {
  const params = useParams<{ id: string }>();
  const id = params?.id; // Ensure it's correctly retrieved
 const pathname=usePathname()
  const invoiceAction=pathname.split("/")[4]
  // console.log(invoiceAction)
  // console.log("Invoice ID:", id);

  return (
    <>
      <InvoiceGenerator customerId={id} invoiceActionCustomer={invoiceAction}/>
    </>
  );
}