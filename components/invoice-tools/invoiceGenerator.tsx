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
      igst:number;
      cgst: number;
      sgst:number;
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
    
    // Helper function to capitalize first letter of each word
    const capitalizeFirstLetter = (text: string) => {
      if (!text) return "";
      return text.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };
    
    // Check if shipping information exists
    const hasShippingInfo = invoiceItem.recipientDetails.shipTo.name || invoiceItem.recipientDetails.shipTo.address;
    
    return (
      <div className="bg-white max-w-8xl mx-auto mt-5 shadow-lg rounded-lg overflow-hidden">
        {/* Watermark for paid invoices */}
        {invoiceItem.status === "Paid" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="transform rotate-[320deg] text-[rgb(156_190_245_/_20%)] text-9xl font-bold">
              PAID
            </div>
          </div>
        )}
        
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-[#3b8ded] to-[#0c69cc] text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col md:flex-row items-start md:items-center mb-4 md:mb-0 w-full md:w-auto">
              {invoiceItem.senderDetails.logo && (
                <img
                  src={invoiceItem.senderDetails.logo}
                  alt="Company Logo"
                  className="h-16 w-auto mr-4 object-contain bg-white p-2 rounded mb-4 md:mb-0"
                />
              )}
              <div className="max-w-full md:max-w-md">
                <h1 className="text-xl md:text-2xl font-bold break-words">{capitalizeFirstLetter(invoiceItem.senderDetails.name)}</h1>
                <p className="text-blue-100 text-sm break-words mt-1">{capitalizeFirstLetter(invoiceItem.senderDetails.address)}</p>
              </div>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <h2 className="text-3xl font-bold">INVOICE</h2>
              <p className="text-blue-100 text-sm">#{invoiceItem.invoiceDetails.number}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Invoice Details and Recipient Information */}
          <div className={`grid grid-cols-1 ${hasShippingInfo ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-8`}>
            {/* Invoice Details */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-gray-700 font-semibold mb-3 pb-2 border-b border-gray-300">Invoice Details</h3>
              <div className="space-y-2">
                {invoiceItem.invoiceDetails.date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(invoiceItem.invoiceDetails.date).toLocaleDateString()}</span>
                  </div>
                )}
                {invoiceItem.invoiceDetails.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{new Date(invoiceItem.invoiceDetails.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                {invoiceItem.invoiceDetails.paymentTerms && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span className="font-medium">{invoiceItem.invoiceDetails.paymentTerms}</span>
                  </div>
                )}
                {invoiceItem.invoiceDetails.poNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">PO Number:</span>
                    <span className="font-medium">{invoiceItem.invoiceDetails.poNumber}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bill To */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-gray-700 font-semibold mb-3 pb-2 border-b border-gray-300">Bill To</h3>
              {invoiceItem.recipientDetails.billTo.name && (
                <p className="font-medium text-gray-800 mb-1 break-words">{capitalizeFirstLetter(invoiceItem.recipientDetails.billTo.name)}</p>
              )}
              {invoiceItem.recipientDetails.billTo.address && (
                <p className="text-gray-600 text-sm break-words">{capitalizeFirstLetter(invoiceItem.recipientDetails.billTo.address)}</p>
              )}
            </div>
            
            {/* Ship To - Only show if shipping information exists */}
            {hasShippingInfo && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-gray-700 font-semibold mb-3 pb-2 border-b border-gray-300">Ship To</h3>
                {invoiceItem.recipientDetails.shipTo.name && (
                  <p className="font-medium text-gray-800 mb-1 break-words">{capitalizeFirstLetter(invoiceItem.recipientDetails.shipTo.name)}</p>
                )}
                {invoiceItem.recipientDetails.shipTo.address && (
                  <p className="text-gray-600 text-sm break-words">{capitalizeFirstLetter(invoiceItem.recipientDetails.shipTo.address)}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Items Table */}
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Sr.No</th>
                  {invoiceItem.items.length > 0 &&
                    typeof invoiceItem.items[0].data === "object" &&
                    invoiceItem.items[0].data !== null ? (
                      Object.keys(invoiceItem.items[0].data).map((key) => (
                        <th key={key} className="border border-gray-300 px-4 py-3 text-left font-semibold capitalize">
                          {key}
                        </th>
                      ))
                    ) : (
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Description</th>
                    )}
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Quantity</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Rate</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItem.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-3">{index + 1}</td>
                    {typeof item.data === "object" && item.data !== null ? (
                      Object.keys(item.data).map((key:any) => (
                        <td key={key} className="border border-gray-300 px-4 py-3">
                          {item.data[key]}
                        </td>
                      ))
                    ) : (
                      <td className="border border-gray-300 px-4 py-3">
                        {(item as any).description || item.data || "-"}
                      </td>
                    )}
                    <td className="border border-gray-300 px-4 py-3 text-right">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">
                      {formatCurrency(item.rate, invoiceItem.invoiceDetails.currency)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                      {formatCurrency(item.amount, invoiceItem.invoiceDetails.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Totals Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Notes and Terms */}
            <div className="flex-1 min-w-0">
              {invoiceItem.notes && (
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-gray-700 font-semibold mb-2 pb-1 border-b border-gray-300">Notes</h3>
                  <p className="text-gray-800 whitespace-pre-line">{invoiceItem.notes}</p>
                </div>
              )}
              {invoiceItem.terms && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-gray-700 font-semibold mb-2 pb-1 border-b border-gray-300">Terms</h3>
                  <p className="text-gray-800 whitespace-pre-line">{invoiceItem.terms}</p>
                </div>
              )}
            </div>
            
            {/* Totals Summary */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 w-full lg:w-96">
              <h3 className="text-gray-700 font-semibold mb-3 pb-2 border-b border-gray-300">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(invoiceItem.totals.subtotal, invoiceItem.invoiceDetails.currency)}
                  </span>
                </div>
                
                {invoiceItem.totals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">
                      -{formatCurrency(invoiceItem.totals.discount, invoiceItem.invoiceDetails.currency)}
                    </span>
                  </div>
                )}
                
                {invoiceItem.totals.igst > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">IGST:</span>
                    <span className="font-medium">
                      {formatCurrency(invoiceItem.totals.igst, invoiceItem.invoiceDetails.currency)}
                    </span>
                  </div>
                )}
                
                {invoiceItem.totals.cgst > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGST:</span>
                    <span className="font-medium">
                      {formatCurrency(invoiceItem.totals.cgst, invoiceItem.invoiceDetails.currency)}
                    </span>
                  </div>
                )}
                
                {invoiceItem.totals.sgst > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">SGST:</span>
                    <span className="font-medium">
                      {formatCurrency(invoiceItem.totals.sgst, invoiceItem.invoiceDetails.currency)}
                    </span>
                  </div>
                )}
                
                {invoiceItem.totals.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tax:</span>
                    <span className="font-medium">
                      {formatCurrency(invoiceItem.totals.tax, invoiceItem.invoiceDetails.currency)}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>
                      {formatCurrency(invoiceItem.totals.total, invoiceItem.invoiceDetails.currency)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className={invoiceItem.status === "Paid" ? "text-green-600 font-semibold" : ""}>
                    {formatCurrency(invoiceItem.totals.amountPaid, invoiceItem.invoiceDetails.currency)}
                  </span>
                </div>
                
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span className={invoiceItem.status === "Paid" ? "text-green-600" : "text-red-600"}>
                      Balance Due:
                    </span>
                    <span className={invoiceItem.status === "Paid" ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(invoiceItem.totals.balanceDue, invoiceItem.invoiceDetails.currency)}
                    </span>
                  </div>
                </div>
                
                {/* Amount in Words */}
                {invoiceItem.status === "Paid" && (
                  <div className="text-gray-600 text-sm italic text-right mt-2">
                    <span>Amount in Words:</span> ({amountInWords} only)
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    );
  }