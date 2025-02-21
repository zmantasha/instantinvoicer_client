// import { useMemo } from "react";
// import { formatCurrency} from "../../lib/utils/format-currency";
// import { toWords } from "number-to-words"; 

// interface InvoiceItem {
//     senderDetails: { name: string;
//       logo:string;
//       address:string; 
//     };
//     invoiceDetails: {
//       number: string;
//       date: string;
//       paymentTerms?: string;
//       dueDate?: string;
//       poNumber?: string;
//       currency: string;
//     };
//     recipientDetails: {
//       billTo: { name: string,address: string };
//       shipTo: { name: string,address: string  };
//     };
//     userId:{
//       logo:string;
//     };
//     items: { id: string; description: string; quantity: number; rate: number; amount: number }[];
//     totals: {
//       balanceDue: number;
//       subtotal: number;
//       discount: number;
//       shipping: number;
//       tax: number;
//       total: number;
//       amountPaid: number;
//     };
//     notes?: string;
//     terms?: string;
//     status?:string;
//   }
  
//   export default function InvoiceGenerator({ invoiceItem }: { invoiceItem: InvoiceItem }) {
//     const amountInWords = useMemo(() => {
//       if (invoiceItem.status === "Paid") {
//         return toWords(invoiceItem.totals.amountPaid).replace(/\b\w/g, (char) =>
//           char.toUpperCase()
//         ); // Capitalize the first letter of each word
//       }
//       return "";
//     }, [invoiceItem]);
//     return (
//       <>
//        <div className="p-4 sm:p-6 lg:p-8 relative">
//         {invoiceItem.status === "Paid" && (
//           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//              <div className="transform rotate-[320deg] text-[rgb(156_190_245_/_20%)] text-9xl font-bold">
//           PAID
//         </div>
//           </div>
//         )}
//           {/* Header Section */}
//           <div className="flex flex-col sm:flex-row sm:justify-between items-start">
//             {/* Sender Details */}
//             <div className="flex flex-col sm:flex-row sm:items-center space-x-0 sm:space-x-4">
//               <div className="flex flex-col">
//               {invoiceItem.senderDetails.logo && (
//                 <img
//                   src={invoiceItem.senderDetails.logo}
//                   alt="Profile"
//                   className="max-w-full max-h-full w-auto h-auto sm:w-32 sm:h-32 object-contain rounded-sm"
//                 />
//               )}
//               <div className="mt-4 sm:mt-0">
//                 <p className="text-gray-600">From</p>
//                 <p className="text-gray-900  capitalize">{invoiceItem.senderDetails.name}</p>
//               </div>
//               <div className="mt-4 sm:mt-0">
//                 <p className="text-gray-600">Address</p>
//                 <p className="text-gray-900 capitalize">{invoiceItem.senderDetails.address}</p>
//               </div>
//               </div>
//             </div>

//             {/* Invoice Number */}
//             <h1 className="text-3xl sm:text-4xl mt-4 sm:mt-0">{invoiceItem.invoiceDetails.number}</h1>
//           </div>

//           {/* Recipient and Invoice Details */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
//             <div>
//               {invoiceItem.recipientDetails.billTo.name && (
//                 <div>
//                   <p className="text-gray-600">Bill To</p>
//                   <p className="text-gray-900  capitalize">{invoiceItem.recipientDetails.billTo.name}</p>
//                 </div>
//               )}
//               {invoiceItem.recipientDetails.billTo.address && (
//                 <div>
//                   <p className="text-gray-600 mt-3">Billing Address</p>
//                   <p className="text-gray-900 capitalize">{invoiceItem.recipientDetails.billTo.address}</p>
//                 </div>
//               )}
//             </div>

//             <div>
//               {invoiceItem.recipientDetails.shipTo.name && (
//                 <div>
//                   <p className="text-gray-600">Ship To</p>
//                   <p>{invoiceItem.recipientDetails.shipTo.name}</p>
//                 </div>
//               )}
//               {invoiceItem.recipientDetails.shipTo.address && (
//                 <div>
//                   <p className="text-gray-600 mt-3">Shipping Address</p>
//                   <p>{invoiceItem.recipientDetails.shipTo.address}</p>
//                 </div>
//               )}
//             </div>
//             <div className="bg-gray-50 p-4 shadow-sm rounded">
//               {invoiceItem.invoiceDetails.date && (
//                 <div className="flex justify-between py-1">
//                   <p className="text-gray-600">Date</p>
//                   <p>{new Date(invoiceItem.invoiceDetails.date).toLocaleDateString()}</p>
//                 </div>
//               )}
//               {invoiceItem.invoiceDetails.paymentTerms && (
//                 <div className="flex justify-between py-1">
//                   <p className="text-gray-600">Payment Terms</p>
//                   <p>{invoiceItem.invoiceDetails.paymentTerms}</p>
//                 </div>
//               )}
//               {invoiceItem.invoiceDetails.dueDate && (
//                 <div className="flex justify-between py-1">
//                   <p className="text-gray-600">Due Date</p>
//                   <p>{new Date(invoiceItem.invoiceDetails.dueDate).toLocaleDateString()}</p>
//                 </div>
//               )}
//               {invoiceItem.invoiceDetails.poNumber && (
//                 <div className="flex justify-between py-1">
//                   <p className="text-gray-600">PO Number</p>
//                   <p>{invoiceItem.invoiceDetails.poNumber}</p>
//                 </div>
//               )}
//               <div className="flex justify-between py-2 bg-gray-200 rounded-sm px-2">
//                 <p className="font-bold">Balance</p>
//                 <p>
//                   {formatCurrency(
//                     Number(invoiceItem.totals.balanceDue.toFixed(2)),
//                     invoiceItem.invoiceDetails.currency
//                   )}
//                 </p>
//               </div>
//             </div>
//           </div>
  
//           {/* Items Table */}
//           <div className="mt-8 overflow-x-auto">
//             <table className="min-w-full text-sm border border-gray-300">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="border border-gray-300 px-4 py-2 text-left">Sr.No</th>
//                   <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
//                   <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
//                   <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
//                   <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {invoiceItem.items.map((item, index) => (
//                   <tr
//                     key={item.id}
//                     className="odd:bg-white even:bg-gray-50"
//                   >
//                     <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
//                     <td className="border border-gray-300 px-4 py-2">{item.description}</td>
//                     <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
//                     <td className="border border-gray-300 px-4 py-2 text-right">
//                       {formatCurrency(item.rate, invoiceItem.invoiceDetails.currency)}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2 text-right">
//                       {formatCurrency(item.amount, invoiceItem.invoiceDetails.currency)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
  
//           {/* Totals Section */}
//           <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div>
//               {invoiceItem.notes && (
//                 <div className="mb-4">
//                   <p className="text-gray-600 font-bold">Notes</p>
//                   <p className="text-gray-800">{invoiceItem.notes}</p>
//                 </div>
//               )}
//               {invoiceItem.terms && (
//                 <div>
//                   <p className="text-gray-600 font-bold">Terms</p>
//                   <p className="text-gray-800">{invoiceItem.terms}</p>
//                 </div>
//               )}
//             </div>
//             <div className="bg-gray-50 p-4 shadow-sm rounded">
//               <div className="flex justify-between py-1">
//                 <p className="text-gray-600">Subtotal</p>
//                 <p>
//                   {formatCurrency(
//                     invoiceItem.totals.subtotal,
//                     invoiceItem.invoiceDetails.currency
//                   )}
//                 </p>
//               </div>
//               <div className="flex justify-between py-1">
//                 <p className="text-gray-600">Discount</p>
//                 <p>
//                   {formatCurrency(
//                     invoiceItem.totals.discount,
//                     invoiceItem.invoiceDetails.currency
//                   )}
//                 </p>
//               </div>
//               <div className="flex justify-between py-1">
//                 <p className="text-gray-600">Tax</p>
//                 <p>
//                   {formatCurrency(
//                     invoiceItem.totals.tax,
//                     invoiceItem.invoiceDetails.currency
//                   )}
//                 </p>
//               </div>
//               <hr className="my-2" />
//               <div className="flex justify-between font-bold py-2">
//                 <p>Total</p>
//                 <p>
//                   {formatCurrency(
//                     invoiceItem.totals.total,
//                     invoiceItem.invoiceDetails.currency
//                   )}
//                 </p>
//               </div>
//               <div className="flex justify-between py-2">
//               <p className="text-gray-600">Amount Paid</p>
//               <p className={invoiceItem.status === "Paid" ? "text-green-600 font-semibold" : ""}>
//                 {formatCurrency(
//                   invoiceItem.totals.amountPaid,
//                   invoiceItem.invoiceDetails.currency
//                 )}
//               </p>
//             </div>
//             <hr className="my-2" />
//             <div className="flex justify-between font-bold py-2">
//               <p className={invoiceItem.status === "Paid" ? "text-green-600" : "text-red-600"}>
//                 Balance Due
//               </p>
//               <p className={invoiceItem.status === "Paid" ? "text-green-600" : "text-red-600"}>
//                 {formatCurrency(
//                   invoiceItem.totals.balanceDue,
//                   invoiceItem.invoiceDetails.currency
//                 )}
//               </p>
//             </div>
//                 {/* Show Amount in Words if Paid */}
//                 {invoiceItem.status === "Paid" && (
//                   <div className="text-black-600 text-sm font-bold italic text-right mt-1">
//                     <span>Amount in Words:</span> ({amountInWords} only)
//                   </div>
//                   ) }

//             </div>
//           </div>
//         </div>
//       </>
//     );
//   }

import { useMemo } from "react";
import { formatCurrency} from "../../lib/utils/format-currency";
import { toWords } from "number-to-words"; // Importing the number-to-words library

interface InvoiceItem {
    senderDetails: { name: string;
      logo:string;
      address:string; 
    };
    invoiceDetails: {
      number: string;
      date: string;
      paymentTerms?: string;
      dueDate?: string;
      poNumber?: string;
      currency: string;
    };
    recipientDetails: {
      billTo: { name: string,address: string };
      shipTo: { name: string,address: string  };
    };
    userId:{
      logo:string;
    };
    items: { id: string; data: string; quantity: number; rate: number; amount: number }[];
    totals: {
      balanceDue: number;
      subtotal: number;
      discount: number;
      shipping: number;
      tax: number;
      total: number;
      amountPaid: number;
    };
    notes?: string;
    terms?: string;
    status?:string;
  }
  
  export default function InvoiceGenerator({ invoiceItem }: { invoiceItem: InvoiceItem }) {
    const amountInWords = useMemo(() => {
      if (invoiceItem.status === "Paid") {
        return toWords(invoiceItem.totals.amountPaid).replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ); // Capitalize the first letter of each word
      }
      return "";
    }, [invoiceItem]);
    // console.log(invoiceItem?.items[0].data);
    
    return (
      <>
       <div className="p-4 sm:p-6 lg:p-8 relative">
        {invoiceItem.status === "Paid" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform rotate-[320deg] text-[rgb(156_190_245_/_20%)] text-9xl font-bold">
          PAID
        </div>
          </div>
        )}
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start">
            {/* Sender Details */}
            <div className="flex flex-col sm:flex-row sm:items-center space-x-0 sm:space-x-4">
              <div className="flex flex-col">
              {invoiceItem.senderDetails.logo && (
                <img
                  src={invoiceItem.senderDetails.logo}
                  alt="Profile"
                  className="max-w-full max-h-full w-auto h-auto sm:w-32 sm:h-32 object-contain rounded-sm"
                />
              )}
              <div className="mt-4 sm:mt-0">
                <p className="text-gray-600">From</p>
                <p className="text-gray-900  capitalize">{invoiceItem.senderDetails.name}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <p className="text-gray-600">Address</p>
                <p className="text-gray-900 capitalize">{invoiceItem.senderDetails.address}</p>
              </div>
              </div>
            </div>

            {/* Invoice Number */}
            <h1 className="text-3xl sm:text-4xl mt-4 sm:mt-0">{invoiceItem.invoiceDetails.number}</h1>
          </div>

          {/* Recipient and Invoice Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div>
              {invoiceItem.recipientDetails.billTo.name && (
                <div>
                  <p className="text-gray-600">Bill To</p>
                  <p className="text-gray-900  capitalize">{invoiceItem.recipientDetails.billTo.name}</p>
                </div>
              )}
              {invoiceItem.recipientDetails.billTo.address && (
                <div>
                  <p className="text-gray-600 mt-3">Billing Address</p>
                  <p className="text-gray-900 capitalize">{invoiceItem.recipientDetails.billTo.address}</p>
                </div>
              )}
            </div>

            <div>
              {invoiceItem.recipientDetails.shipTo.name && (
                <div>
                  <p className="text-gray-600">Ship To</p>
                  <p>{invoiceItem.recipientDetails.shipTo.name}</p>
                </div>
              )}
              {invoiceItem.recipientDetails.shipTo.address && (
                <div>
                  <p className="text-gray-600 mt-3">Shipping Address</p>
                  <p>{invoiceItem.recipientDetails.shipTo.address}</p>
                </div>
              )}
            </div>
            <div className="bg-gray-50 p-4 shadow-sm rounded">
              {invoiceItem.invoiceDetails.date && (
                <div className="flex justify-between py-1">
                  <p className="text-gray-600">Date</p>
                  <p>{new Date(invoiceItem.invoiceDetails.date).toLocaleDateString()}</p>
                </div>
              )}
              {invoiceItem.invoiceDetails.paymentTerms && (
                <div className="flex justify-between py-1">
                  <p className="text-gray-600">Payment Terms</p>
                  <p>{invoiceItem.invoiceDetails.paymentTerms}</p>
                </div>
              )}
              {invoiceItem.invoiceDetails.dueDate && (
                <div className="flex justify-between py-1">
                  <p className="text-gray-600">Due Date</p>
                  <p>{new Date(invoiceItem.invoiceDetails.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              {invoiceItem.invoiceDetails.poNumber && (
                <div className="flex justify-between py-1">
                  <p className="text-gray-600">PO Number</p>
                  <p>{invoiceItem.invoiceDetails.poNumber}</p>
                </div>
              )}
              <div className="flex justify-between py-2 bg-gray-200 rounded-sm px-2">
                <p className="font-bold">Balance</p>
                <p>
                  {formatCurrency(
                    Number(invoiceItem.totals.balanceDue.toFixed(2)),
                    invoiceItem.invoiceDetails.currency
                  )}
                </p>
              </div>
            </div>
          </div>
  
          {/* Items Table */}
          <div className="mt-8 overflow-x-auto">
  <table className="min-w-full text-sm border border-gray-300">
    <thead>
      <tr className="bg-gray-200">
        <th className="border border-gray-300 px-4 py-2 text-left">Sr.No</th>
        {/* Dynamically generate headers based on keys in the first item's data object */}
        {invoiceItem.items.length > 0 &&
          Object.keys(invoiceItem.items[0].data).map((key) => (
            <th key={key} className="border border-gray-300 px-4 py-2 text-left capitalize">
              {key}
            </th>
          ))}
                  <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItem.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="odd:bg-white even:bg-gray-50"
                  >
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
              {/* Dynamically render data based on keys */}
              {Object.keys(item.data).map((key:any) => (
                        <td key={key} className="border border-gray-300 px-4 py-2">
                          {item.data[key]}
                        </td>
                      ))}
                    <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {formatCurrency(item.rate, invoiceItem.invoiceDetails.currency)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {formatCurrency(item.amount, invoiceItem.invoiceDetails.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Totals Section */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {invoiceItem.notes && (
                <div className="mb-4">
                  <p className="text-gray-600 font-bold">Notes</p>
                  <p className="text-gray-800">{invoiceItem.notes}</p>
                </div>
              )}
              {invoiceItem.terms && (
                <div>
                  <p className="text-gray-600 font-bold">Terms</p>
                  <p className="text-gray-800">{invoiceItem.terms}</p>
                </div>
              )}
            </div>
            <div className="bg-gray-50 p-4 shadow-sm rounded">
              <div className="flex justify-between py-1">
                <p className="text-gray-600">Subtotal</p>
                <p>
                  {formatCurrency(
                    invoiceItem.totals.subtotal,
                    invoiceItem.invoiceDetails.currency
                  )}
                </p>
              </div>
              <div className="flex justify-between py-1">
                <p className="text-gray-600">Discount</p>
                <p>
                  {formatCurrency(
                    invoiceItem.totals.discount,
                    invoiceItem.invoiceDetails.currency
                  )}
                </p>
              </div>
              <div className="flex justify-between py-1">
                <p className="text-gray-600">Tax</p>
                <p>
                  {formatCurrency(
                    invoiceItem.totals.tax,
                    invoiceItem.invoiceDetails.currency
                  )}
                </p>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold py-2">
                <p>Total</p>
                <p>
                  {formatCurrency(
                    invoiceItem.totals.total,
                    invoiceItem.invoiceDetails.currency
                  )}
                </p>
              </div>
              <div className="flex justify-between py-2">
              <p className="text-gray-600">Amount Paid</p>
              <p className={invoiceItem.status === "Paid" ? "text-green-600 font-semibold" : ""}>
                {formatCurrency(
                  invoiceItem.totals.amountPaid,
                  invoiceItem.invoiceDetails.currency
                )}
              </p>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold py-2">
              <p className={invoiceItem.status === "Paid" ? "text-green-600" : "text-red-600"}>
                Balance Due
              </p>
              <p className={invoiceItem.status === "Paid" ? "text-green-600" : "text-red-600"}>
                {formatCurrency(
                  invoiceItem.totals.balanceDue,
                  invoiceItem.invoiceDetails.currency
                )}
              </p>
            </div>
                {/* Show Amount in Words if Paid */}
                {invoiceItem.status === "Paid" && (
                  <div className="text-black-600 text-sm font-bold italic text-right mt-1">
                    <span>Amount in Words:</span> ({amountInWords} only)
                  </div>
                  ) }

            </div>
          </div>
        </div>
      </>
    );
  }
