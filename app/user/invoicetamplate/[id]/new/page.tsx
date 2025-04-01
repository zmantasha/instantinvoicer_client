// "use client"

// import InvoiceGenerator from "@/components/invoice/invoice-generator";
// import { useParams } from "next/navigation";
// import { useMemo } from "react";

// export default function NewInvoiceCustomer(){
//   const { id } = useParams<{ id: string }>();
//   console.log(id)
//     // Memoize the invoiceId to prevent unnecessary recalculations
//     const memoizedInvoiceId = useMemo(() => id, [id]);
//         <>
//        <InvoiceGenerator invoiceId={memoizedInvoiceId} />
//         </>
// }

"use client";

import InvoiceGenerator from "@/components/invoice/invoice-generator";
import { useParams, usePathname } from "next/navigation";

export default function NewInvoiceCustomer() {
  const params = useParams<{ id: string }>();
  const id = params?.id; // Ensure it's correctly retrieved
 const pathname=usePathname()
  const invoiceAction=pathname.split("/")[4]
  console.log(invoiceAction)
  // console.log("Invoice ID:", id);

  return (
    <>
      <InvoiceGenerator invoiceId={id||undefined} invoiceActionCustomer={invoiceAction}/>
    </>
  );
}