
// "use client";

// import { InvoiceHeader } from "./invoice-header";
// import { InvoiceItemsTable } from "./invoice-items-table";
// import { InvoiceTotals } from "./invoice-totals";
// import { InvoiceNotes } from "./invoice-notes";
// import { Button } from "../../components/ui/button";
// import { Download } from "lucide-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { currencies } from "../../lib/constants/currencies";
// import { useInvoice } from "../../hooks/use-invoice";
// import styles from "../../app/account/login/login.module.css";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { InvoiceData } from "../../types/invoice";
// import Spinner from "../Spinner";

// export default function InvoiceGenerator({ invoiceId }: { invoiceId?: string }) {
//   const [isLoading, setIsLoading] = useState(!!invoiceId);
//   const [initialData, setInitialData] = useState<InvoiceData | undefined>(undefined);

//   useEffect(() => {
//     const fetchInvoiceData = async () => {
//       if (invoiceId) {
//         try {
//           const response = await axios.get<InvoiceData>(
//             `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${invoiceId}`,
//             { withCredentials: true }
//           );
//           setInitialData(response.data);
//         } catch (error) {
//           console.error("Failed to fetch invoice:", error);
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     };

//     fetchInvoiceData();
//   }, [invoiceId]);

//   const {
//     invoiceData,
//     updateSenderDetails,
//     updateRecipientDetails,
//     updateInvoiceDetails,
//     updateItems,
//     updateTotals,
//     updateNotes,
//     updateTerms,
//     generatePDF,
//     saveInvoice,
//     formErrors,
//     formTouched,
//     formik,
//   } = useInvoice(initialData);

//   if (isLoading) {
//     return <Spinner loading={true} color="teal" />;
//   }

//   return (
//     <div className="w-full max-w-[1334px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
//       {/* Top Actions */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <Button variant="default" onClick={generatePDF} className="w-full sm:w-auto">
//           <Download className="w-4 h-4 mr-2" />
//           Download PDF
//         </Button>
        
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
//           <div className="flex items-center gap-2 w-full sm:w-auto">
//             <span className="text-sm text-gray-500 whitespace-nowrap">Currency</span>
//             <Select
//               value={formik.values.invoiceDetails.currency}
//               onValueChange={(currency) =>
//                 formik.setFieldValue("invoiceDetails.currency", currency)
//               }
//             >
//               <SelectTrigger className="w-full sm:w-[160px]">
//                 <SelectValue placeholder="Select Currency" />
//               </SelectTrigger>
//               <SelectContent>
//                 {currencies.map((currency) => (
//                   <SelectItem key={currency.value} value={currency.value}>
//                     {currency.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//               <Button 
//           type="button" 
//           variant="outline" 
//           className="text-[#003366] w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
//           onClick={() => saveInvoice()}
//           disabled={formik.isSubmitting}  // Disable when submitting
//         >
//           {formik.isSubmitting ? "Saving..." : invoiceId ? "Update Invoice" : "Save Invoice"}
//         </Button>
//         </div>
//       </div>

     

//       {/* Main Content */}
//       <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 space-y-6 md:space-y-8">
//         <InvoiceHeader
//           senderDetails={invoiceData.senderDetails}
//           recipientDetails={invoiceData.recipientDetails}
//           invoiceDetails={invoiceData.invoiceDetails}
//           onUpdateSender={updateSenderDetails}
//           onUpdateRecipient={updateRecipientDetails}
//           onUpdateInvoice={updateInvoiceDetails}
//           formErrors={formErrors}
//           formTouched={formTouched}
//           formik={formik}
//         />
        
//         <InvoiceItemsTable
//           items={invoiceData.items}
//           currency={invoiceData.invoiceDetails.currency}
//           onUpdateItems={updateItems}
//           formErrors={formErrors}
//           formTouched={formTouched}
//         />

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
//           <InvoiceNotes
//             notes={invoiceData.notes}
//             terms={invoiceData.terms}
//             onUpdateNotes={updateNotes}
//             onUpdateTerms={updateTerms}
//           />

//           <InvoiceTotals
//             totals={invoiceData.totals}
//             currency={invoiceData.invoiceDetails.currency}
//             onUpdate={updateTotals}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { InvoiceHeader } from "./invoice-header";
import { InvoiceItemsTable } from "./invoice-items-table";
import { InvoiceTotals } from "./invoice-totals";
import { InvoiceNotes } from "./invoice-notes";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currencies } from "../../lib/constants/currencies";
import { useInvoice } from "../../hooks/use-invoice";
import { useEffect, useState } from "react";
import axios from "axios";
import { InvoiceData } from "../../types/invoice";
import Spinner from "../Spinner";

export default function InvoiceGenerator({ invoiceId }: { invoiceId?: string }) {
  const [isLoading, setIsLoading] = useState(!!invoiceId);
  const [initialData, setInitialData] = useState<InvoiceData | undefined>(undefined);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (invoiceId) {
        try {
          const response = await axios.get<InvoiceData>(
            `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${invoiceId}`,
            { withCredentials: true }
          );
          setInitialData(response.data);
        } catch (error) {
          console.error("Failed to fetch invoice:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInvoiceData();
  }, [invoiceId]);

  const {
    invoiceData,
    updateSenderDetails,
    updateRecipientDetails,
    updateInvoiceDetails,
    updateItems,
    updateTotals,
    updateNotes,
    updateTerms,
    generatePDF,
    saveInvoice,
    formErrors,
    formTouched,
    formik,
    updateItemHeaders,
  } = useInvoice(initialData);

   if (isLoading) {
    return <Spinner loading={true} color="teal" />;
  }

  return (
    <div className="w-full max-w-[1334px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Top Actions */}
      <div className="flex flex-col  sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="default" onClick={generatePDF} className="w-full sm:w-auto ">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500 whitespace-nowrap">Currency</span>
            <Select
              value={formik.values.invoiceDetails.currency}
              onValueChange={(currency) =>
                formik.setFieldValue("invoiceDetails.currency", currency)
              }
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
  type="button" 
  variant="outline" 
  className="text-[#003366] w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
  onClick={() => saveInvoice()}
  disabled={formik.isSubmitting} // Disable when submitting
>
  {formik.isSubmitting ? "Saving..." : invoiceId ? "Update Invoice" : "Save Invoice"}
</Button>
        </div>
      </div>

     

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 space-y-6 md:space-y-8">
        <InvoiceHeader
          senderDetails={invoiceData.senderDetails}
          recipientDetails={invoiceData.recipientDetails}
          invoiceDetails={invoiceData.invoiceDetails}
          onUpdateSender={updateSenderDetails}
          onUpdateRecipient={updateRecipientDetails}
          onUpdateInvoice={updateInvoiceDetails}
          formErrors={formErrors}
          formTouched={formTouched}
          formik={formik}
        />
         {/* <ItemHeaders
        itemHeaders={invoiceData.itemHeaders}
        onUpdateItemHeaders={updateItemHeaders}
      /> */}
        <InvoiceItemsTable
         items={formik.values.items} // Pass items from formik.values
         currency={formik.values.invoiceDetails.currency}
         itemHeaders={formik.values.itemHeaders}
         onUpdateItems={updateItems}
         onUpdateItemHeaders={updateItemHeaders}
         formErrors={formik.errors}
         formTouched={formik.touched}
         formik={formik}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <InvoiceNotes
            notes={invoiceData.notes}
            terms={invoiceData.terms}
            onUpdateNotes={updateNotes}
            onUpdateTerms={updateTerms}
          />

          <InvoiceTotals
            totals={invoiceData.totals}
            currency={invoiceData.invoiceDetails.currency}
            onUpdate={updateTotals}
          />
        </div>
      </div>
    </div>
  );
}