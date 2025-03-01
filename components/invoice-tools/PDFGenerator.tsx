"use client";
import jsPDF from "jspdf";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { formatDownloadCurrency } from "@/lib/utils/format-currency";
import "jspdf-autotable";

interface InvoiceItem {
  id: string;
  data: Record<string, string>;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceDetails: {
    number: string;
    date: string;
    dueDate: string;
    paymentTerms: string;
    poNumber: string;
    currency: string;
  };
  senderDetails: {
    name: string;
    logo?: string;
    address: string;
  };
  recipientDetails: {
    billTo: {
      name: string;
      address: string;
    };
    shipTo: {
      name: string;
      address: string;
    };
  };
   itemHeaders: string[];
   items: InvoiceItem[];
  totals: {
    subtotal: number;
    tax: number;
    taxRate: number;
    taxType: string;
    discount: number;
    igst:number;
    cgst: number;
    sgst:number;
    shipping: number;
    discountType: "percentage" | "fixed";
    amountPaid: number;
    total: number;
    balanceDue: number;
  };
  notes?: string;
  terms?: string;
  status?: string;
}

interface PDFGeneratorProps {
  invoiceData: InvoiceData;
  fileName: string;
}

export default function PDFGenerator({ invoiceData, fileName }: PDFGeneratorProps) {
  const generatePDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      const margin = 18;
      let contentY = margin; // Track vertical position



     
      // Add watermark if status is Paid
      // if (invoiceData.status === "Paid") {
      //   const fontSize = 100;
      //   const watermarkText = "PAID";
      //   const textWidth = pdf.getTextWidth(watermarkText);
      
      //   // Calculate center position
      //   const centerX = (pageWidth - textWidth) / 2;
      //   const centerY = pageHeight / 2;
      
      //   // Use a light blue shade that simulates transparency
      //   pdf.setFontSize(fontSize);
      //   pdf.setFont("helvetica", "bold");
      //   pdf.setTextColor(200, 220, 255); // Adjusted RGB values for a light effect
      
      //   // Add rotated watermark text
      //   pdf.text(watermarkText, centerX, centerY, {
      //     angle: 45,
      //     align: "center",
      //     baseline: "middle",
      //   });
      
      //   // Reset text color to normal
      //   pdf.setTextColor(0, 0, 0);
      //   pdf.setFontSize(12);
      //   pdf.setFont("helvetica", "normal");
      // }
      // Add watermark if status is Paid
// if (invoiceData.status === "Paid") {
//   const fontSize = 60; // Adjust font size for table cell
//   const watermarkText = "PAID";

//   // Get table cell dimensions
//   const startX = 50; // X position of the table (adjust as needed)
//   const startY = 100; // Y position where the table starts (adjust as needed)
//   const cellWidth = 100; // Approximate width of a table cell
//   const cellHeight = 50; // Approximate height of a table cell
//   const textX = startX + cellWidth / 2; // Center within cell
//   const textY = startY + cellHeight / 2; // Center within cell

//   // Use a very light blue shade for a faded effect
//   pdf.setFontSize(fontSize);
//   pdf.setFont("helvetica", "bold");
//   pdf.setTextColor(200, 220, 255); // Light faded color

//   // Add rotated watermark inside the table cell
//   pdf.text(watermarkText, textX, textY, {
//     angle: 45,
//     align: "center",
//     baseline: "middle",
//   });

//   // Reset text color to normal
//   pdf.setTextColor(0, 0, 0);
//   pdf.setFontSize(12);
//   pdf.setFont("helvetica", "normal");
// }


      // Function to add wrapped text
      const addWrappedText = (
        pdf: jsPDF,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineHeight: number
      ) => {
        const lines = pdf.splitTextToSize(text, maxWidth); // Split text into lines
        lines.forEach((line: string, index: number) => {
          pdf.text(line, x, y + index * lineHeight); // Add each line
        });
        return lines.length * lineHeight; // Return the total height used
      };

      // Function to add the logo
      const addLogo = async () => {
        if (invoiceData.senderDetails.logo) {
          const maxWidth = 50;
          const maxHeight = 25;

          const logoBase64: string = invoiceData.senderDetails.logo;
          const img = new Image();
          img.src = `${logoBase64}`;
          img.crossOrigin = "anonymous"; // Prevent CORS issues

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed to load image."));
          });

          // Calculate aspect ratio and dimensions
          const aspectRatio = img.width / img.height;
          let width = maxWidth;
          let height = width / aspectRatio;

          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }

          // Add the image to the PDF
          pdf.addImage(img, "JPEG", margin, margin, width, height);
          contentY += height + 4; // Adjust Y position below the image
        }
      };

      // Add the logo
      await addLogo();

      // Add "From" section (below the logo)
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text("From:", margin, contentY);
      pdf.setTextColor(0, 0, 0);
      pdf.text(invoiceData.senderDetails.name, margin, contentY + 5);

      // Address label
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text("Address:", margin, contentY + 12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(invoiceData.senderDetails.address, margin, contentY + 17);
      contentY += 13; // Move further down

      // Invoice Number (right-aligned)
      if (invoiceData.senderDetails.logo) {
        pdf.setFontSize(24);
        pdf.setTextColor(14, 54, 94);
        pdf.text(invoiceData.invoiceDetails.number, pageWidth - margin, margin + 20, { align: "right" });
      } else {
        pdf.setFontSize(24);
        pdf.setTextColor(14, 54, 94);
        pdf.text(invoiceData.invoiceDetails.number, pageWidth - margin, margin + 10, { align: "right" });
      }

      // Recipient and Invoice Details Grid (3 columns)
      const gridY = contentY + 18; // Adjust position

      // Bill To Column
      if (invoiceData.recipientDetails.billTo.name) {
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text("Bill To:", margin, gridY);
        pdf.setTextColor(0, 0, 0);

        // Add wrapped text for billing name
        const billingNameHeight = addWrappedText(
          pdf,
          invoiceData.recipientDetails.billTo.name,
          margin,
          gridY + 5,
          pageWidth / 2.9 - margin - 10, // Max width for billing name
          4 // Line height
        );

        // Address label
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text("Billing Address", margin, gridY + 8 + billingNameHeight);
        pdf.setTextColor(0, 0, 0);

        // Add wrapped text for billing address
        const billingAddressHeight = addWrappedText(
          pdf,
          invoiceData.recipientDetails.billTo.address,
          margin,
          gridY + 13 + billingNameHeight,
          pageWidth / 2.9 - margin - 10, // Max width for billing address
          4// Line height
        );

        // Adjust the contentY position based on the height used by the billing name and address
        contentY += billingNameHeight + billingAddressHeight + 10;
      }

      // Ship To Column
      if (invoiceData.recipientDetails.shipTo.name) {
        const middleX = pageWidth / 2.4 - 20;
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text("Ship To", middleX, gridY);
        pdf.setTextColor(0, 0, 0);

        // Add wrapped text for shipping name
        const shippingNameHeight = addWrappedText(
          pdf,
          invoiceData.recipientDetails.shipTo.name,
          middleX,
          gridY + 5,
          pageWidth / 2.5 - margin - 10, // Max width for shipping name
          4 // Line height
        );

        // Address label
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text("Shipping Address", middleX, gridY + 8 + shippingNameHeight);
        pdf.setTextColor(0, 0, 0);

        // Add wrapped text for shipping address
        const shippingAddressHeight = addWrappedText(
          pdf,
          invoiceData.recipientDetails.shipTo.address,
          middleX,
          gridY + 13 + shippingNameHeight,
          pageWidth / 2.5 - margin - 10, // Max width for shipping address
          4 // Line height
        );

        // Adjust the contentY position based on the height used by the shipping name and address
        contentY += shippingNameHeight + shippingAddressHeight + 10;
      }

      // Invoice Details Box (right column)
      const detailsX = pageWidth - 80;
      const rightMargin = 15;
      const detailsData = [
        invoiceData.invoiceDetails.date && {
          label: "Date",
          value: new Date(invoiceData.invoiceDetails.date).toLocaleDateString(),
        },
        invoiceData.invoiceDetails.paymentTerms && {
          label: "Payment Terms",
          value: invoiceData.invoiceDetails.paymentTerms,
        },
        invoiceData.invoiceDetails.dueDate && {
          label: "Due Date",
          value: new Date(invoiceData.invoiceDetails.dueDate).toLocaleDateString(),
        },
        invoiceData.invoiceDetails.poNumber && {
          label: "PO Number",
          value: invoiceData.invoiceDetails.poNumber,
        },
        invoiceData.totals.balanceDue !== null &&
          invoiceData.totals.balanceDue !== undefined && {
            label: "Balance",
            value: formatDownloadCurrency(
              invoiceData.totals.balanceDue,
              invoiceData.invoiceDetails.currency
            ),
            color: "#DC2626",
          },
      ].filter(Boolean) as { label: string; value: string }[];

      if (detailsData.length > 0) {
        // Add gray background for details box
        pdf.setFillColor(250, 250, 250);
        pdf.rect(detailsX - 5, gridY - 5, 85 - rightMargin, detailsData.length * 10 + 1, "F");

        detailsData.forEach((detail, index) => {
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128);
          pdf.text(detail.label, detailsX, gridY + index * 10);
          pdf.setTextColor(0, 0, 0);
          pdf.text(detail.value, pageWidth - margin, gridY + index * 10, {
            align: "right",
          });
        });
      }

const tableStartY = Math.max(
        gridY + (detailsData.length > 0 ? detailsData.length * 10 + 5 : 5),
        gridY + 30 // Minimum spacing from grid
      );


      
      // Extract dynamic headers from the first item's data keys
const dynamicHeaders =
invoiceData.items.length > 0 ? Object.keys(invoiceData.items[0].data) : [];

// Define the table headers including static columns
const tableHeaders = ["Sr.No", ...dynamicHeaders, "Quantity", "Rate", "Amount"];

// Prepare table data dynamically
const tableData = invoiceData.items.map((item, index) => [
(index + 1).toString(),
...dynamicHeaders.map((key) => item.data[key] || ""), // Extract values dynamically
item.quantity.toString(),
formatDownloadCurrency(item.rate, invoiceData.invoiceDetails.currency),
formatDownloadCurrency(item.amount, invoiceData.invoiceDetails.currency),
]);





      // Totals and Notes Section
   
      (pdf as any).autoTable({
        startY: tableStartY,
        head: [tableHeaders],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [12, 105, 204] },
        columnStyles: {
          0: { cellWidth: 20 },
          ...Object.fromEntries(dynamicHeaders.map((_, i) => [i + 1, { cellWidth: "auto" }])),
          [dynamicHeaders.length + 1]: { cellWidth: 25, halign: "left" },
          [dynamicHeaders.length + 2]: { cellWidth: 25, halign: "left" },
          [dynamicHeaders.length + 3]: { cellWidth: 25, halign: "left" },
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
      
        // Inside the autoTable's didDrawPage function
        didDrawPage: function (data: any) {
          if (invoiceData.status === "Paid") {
            const fontSize = 80; // Adjust for better fit
            const watermarkText = "PAID";
      
            // Get table position
               const pageWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();
              const centerX = pageWidth / 1.8;
              const centerY = pageHeight / 1.5;
      
            pdf.setFont("helvetica", "bold");
      
            // Simulating transparency with layered red text
            const transparencyLevels = [
              { color: [240, 240, 240] }, // Very Light Gray (Almost Invisible)
              { color: [230, 240, 255] }, // Lightest Blue
              { color: [210, 230, 250] }, // Lighter Blue
              { color: [190, 220, 245] }, // Very Light Blue
            ];
      
            transparencyLevels.forEach(({ color }) => {
              pdf.setFontSize(fontSize); // Slightly smaller for each layer
              pdf.setTextColor(color[0], color[1], color[2]); // Set RGB color
              pdf.text(watermarkText, centerX, centerY, {
                angle: 45,
                align: "center",
                baseline: "middle",
              });
            });
      
            // Reset styles
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
          }
        },
      });
      
      const finalY = (pdf as any).lastAutoTable.finalY + 20;
      const totalsHeight = 70; // Height for totals box
      const notesHeight = invoiceData.notes ? pdf.getTextDimensions(invoiceData.notes).h : 0;
      const termsHeight = invoiceData.terms ? pdf.getTextDimensions(invoiceData.terms).h : 0;
      const totalContentHeight = Math.max(totalsHeight, notesHeight + termsHeight);
      // const pageHeight = pdf.internal.pageSize.getHeight();
      const remainingSpace = pageHeight - finalY - 10; // 20px margin
      const totalsX = pageWidth - 80;

      // Check if we need a new page
      if (totalContentHeight > remainingSpace) {
        pdf.addPage();
        const newPageY = 20;

        // Draw totals on new page
        pdf.setFillColor(250, 250, 250);
        pdf.rect(totalsX - 5, newPageY - 5, 85 - rightMargin, totalsHeight, "F");

        // const totalsData = [
        //   { label: "Subtotal", value: formatDownloadCurrency(invoiceData.totals.subtotal, invoiceData.invoiceDetails.currency) },
        //   { label: "Discount", value: formatDownloadCurrency(invoiceData.totals.discount, invoiceData.invoiceDetails.currency) },
        //   { label: "Tax", value: formatDownloadCurrency(invoiceData.totals.tax, invoiceData.invoiceDetails.currency) },
        //   { label: "Tax", value: formatDownloadCurrency(invoiceData.totals.tax, invoiceData.invoiceDetails.currency) },
        //   { label: "Total", value: formatDownloadCurrency(invoiceData.totals.total, invoiceData.invoiceDetails.currency), bold: true },
        //   { label: "Amount Paid", value: formatDownloadCurrency(invoiceData.totals.amountPaid, invoiceData.invoiceDetails.currency) },
        //   { label: "Balance Due", value: formatDownloadCurrency(invoiceData.totals.balanceDue, invoiceData.invoiceDetails.currency), color: "#DC2626" },
        // ];


        const totalsData = [
          { label: "Subtotal", value: formatDownloadCurrency(invoiceData.totals.subtotal, invoiceData.invoiceDetails.currency) },
          ...(invoiceData.totals.discount>0 ? [
             { label: "Discount", value: formatDownloadCurrency(invoiceData.totals.discount, invoiceData.invoiceDetails.currency)} ]: []),
          ...(invoiceData.totals.igst>0 ? [
            { 
              label: "IGST", 
              value: formatDownloadCurrency(invoiceData.totals.igst || 0,  invoiceData.invoiceDetails.currency)
            }
          ] : []),
          ...(invoiceData.totals.cgst>0 ? [
            { 
              label: "CGST", 
              value: formatDownloadCurrency(invoiceData.totals.cgst || 0,  invoiceData.invoiceDetails.currency)
            }
          ] : []),
          ...(invoiceData.totals.sgst>0 ? [
            { 
              label: "SGST", 
              value: formatDownloadCurrency(invoiceData.totals.sgst || 0,  invoiceData.invoiceDetails.currency)
            }
          ] : []),
       
          ...(invoiceData.totals.tax>0 ? 
            [{ label: "Tax", value: formatDownloadCurrency(invoiceData.totals.tax, invoiceData.invoiceDetails.currency) }] : []),
          { label: "Total", value: formatDownloadCurrency(invoiceData.totals.total, invoiceData.invoiceDetails.currency), bold: true },
          { label: "Amount Paid", value: formatDownloadCurrency(invoiceData.totals.amountPaid, invoiceData.invoiceDetails.currency) },
          { label: "Balance Due", value: formatDownloadCurrency(invoiceData.totals.balanceDue, invoiceData.invoiceDetails.currency), color: "#DC2626" },
        ];

        
        totalsData.forEach((total, index) => {
          pdf.setFontSize(9);
          if (total.bold) {
            pdf.setFont("helvetica", "bold");
          } else {
            pdf.setFont("helvetica", "normal");
          }

          if (total.color) {
            pdf.setTextColor(220, 38, 38);
          } else {
            pdf.setTextColor(total.bold ? 0 : 128, total.bold ? 0 : 128, total.bold ? 0 : 128);
          }

          pdf.text(total.label, totalsX, newPageY + index * 10);
          pdf.text(total.value, pageWidth - margin, newPageY + index * 10, { align: "right" });
        });

        // Draw notes and terms
        if (invoiceData.notes || invoiceData.terms) {
          let contentY = newPageY;
          const maxWidth = totalsX - margin - 10;

          if (invoiceData.notes) {
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            pdf.text("Notes", margin, contentY);
            pdf.setTextColor(0, 0, 0);

            const noteLines = pdf.splitTextToSize(invoiceData.notes, maxWidth);
            pdf.text(noteLines, margin, contentY + 7);
            contentY += 10 + (noteLines.length * 5);
          }

          if (invoiceData.terms) {
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            pdf.text("Terms", margin, contentY + 5);
            pdf.setTextColor(0, 0, 0);

            const termLines = pdf.splitTextToSize(invoiceData.terms, maxWidth);
            pdf.text(termLines, margin, contentY + 12);
          }
        }
      } else {
        // Draw everything on current page
        pdf.setFillColor(250, 250, 250);
        pdf.rect(totalsX - 5, finalY - 5, 85 - rightMargin, totalsHeight, "F");

        const totalsData = [
          { label: "Subtotal", value: formatDownloadCurrency(invoiceData.totals.subtotal, invoiceData.invoiceDetails.currency) },
          ...(invoiceData.totals.discount>0 ? [
             { label: "Discount", value: formatDownloadCurrency(invoiceData.totals.discount, invoiceData.invoiceDetails.currency)} ]: []),
          ...(invoiceData.totals.igst>0 ? [
            { 
              label: "IGST", 
              value: formatDownloadCurrency(invoiceData.totals.igst || 0,  invoiceData.invoiceDetails.currency)
            }
          ] : []),
          ...(invoiceData.totals.cgst>0 ? [
            { 
              label: "CGST", 
              value: formatDownloadCurrency(invoiceData.totals.cgst || 0,  invoiceData.invoiceDetails.currency)
            }
          ] : []),
          ...(invoiceData.totals.sgst>0 ? [
            { 
              label: "SGST", 
              value: formatDownloadCurrency(invoiceData.totals.sgst || 0,  invoiceData.invoiceDetails.currency)
            }
          ] : []),
       
          ...(invoiceData.totals.tax>0 ? 
            [{ label: "Tax", value: formatDownloadCurrency(invoiceData.totals.tax, invoiceData.invoiceDetails.currency) }] : []),
          { label: "Total", value: formatDownloadCurrency(invoiceData.totals.total, invoiceData.invoiceDetails.currency), bold: true },
          { label: "Amount Paid", value: formatDownloadCurrency(invoiceData.totals.amountPaid, invoiceData.invoiceDetails.currency) },
          { label: "Balance Due", value: formatDownloadCurrency(invoiceData.totals.balanceDue, invoiceData.invoiceDetails.currency), color: "#DC2626" },
        ];

        totalsData.forEach((total, index) => {
          pdf.setFontSize(9);
          if (total.bold) {
            pdf.setFont("helvetica", "bold");
          } else {
            pdf.setFont("helvetica", "normal");
          }

          if (total.color) {
            pdf.setTextColor(220, 38, 38);
          } else {
            pdf.setTextColor(total.bold ? 0 : 128, total.bold ? 0 : 128, total.bold ? 0 : 128);
          }

          pdf.text(total.label, totalsX, finalY + index * 10);
          pdf.text(total.value, pageWidth - margin, finalY + index * 10, { align: "right" });
        });

        // Draw notes and terms
        if (invoiceData.notes || invoiceData.terms) {
          let contentY = finalY;
          const maxWidth = totalsX - margin - 10;

          if (invoiceData.notes) {
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            pdf.text("Notes", margin, contentY);
            pdf.setTextColor(0, 0, 0);

            const noteLines = pdf.splitTextToSize(invoiceData.notes, maxWidth);
            pdf.text(noteLines, margin, contentY + 7);
            contentY += 10 + (noteLines.length * 5);
          }

          if (invoiceData.terms) {
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            pdf.text("Terms", margin, contentY + 5);
            pdf.setTextColor(0, 0, 0);

            const termLines = pdf.splitTextToSize(invoiceData.terms, maxWidth);
            pdf.text(termLines, margin, contentY + 12);
          }
        }
      }

      // Save the PDF
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <Button variant="outline" className="text-gray-600" onClick={generatePDF}>
      <Download className="w-4 h-4 mr-2" />
      Download
    </Button>
  );
}

