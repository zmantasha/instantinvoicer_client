
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { InvoiceData } from "../../types/invoice";
import { formatDownloadCurrency } from "./format-currency";

export async function generateInvoicePDF(invoice: Omit<InvoiceData, "_id">): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  let contentY = margin;
  // Function to add wrapped text
  const addWrappedText = (
   doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const lines =doc.splitTextToSize(text, maxWidth); // Split text into lines
    lines.forEach((line: string, index: number) => {
     doc.text(line, x, y + index * lineHeight); // Add each line
    });
    return lines.length * lineHeight; // Return the total height used
  };
  // Header Section with Logo and Invoice Number
  const addLogo = async () => {
    if (invoice.senderDetails.logo) {
      const maxWidth = 50;
      const maxHeight = 25;

      const logoBase64: string = invoice.senderDetails.logo;
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

      // Add the image to thedoc
      doc.addImage(img, "JPEG", margin, margin, width, height);
      contentY += height + 4; // Adjust Y position below the image
    }
  };

  // Add the logo
  await addLogo();
  
  // Add "From" section (below the logo)
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text("From:", margin, contentY);
  doc.setTextColor(0, 0, 0);
  doc.text(invoice.senderDetails.name, margin, contentY + 5);
  
  // Address label
  if (invoice.senderDetails.address) {
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text("Address:", margin, contentY + 12);
  doc.setTextColor(0, 0, 0);
  doc.text(invoice.senderDetails.address, margin, contentY + 17);
  contentY += 13; // Move further down
  }
  // Invoice Number (right-aligned)
  if (invoice.senderDetails.logo) {
  doc.setFontSize(24);
  doc.text(invoice.invoiceDetails.number, pageWidth - margin, margin + 20, { align: "right" });
  }else{
    doc.setFontSize(24);
    doc.text(invoice.invoiceDetails.number, pageWidth - margin, margin + 10, { align: "right" });
  }
  // Recipient and Invoice Details Grid (3 columns)
  const gridY = contentY + 18; // Adjust position
  
  // Bill To Column
  if (invoice.recipientDetails.billTo.name) {
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text("Bill To:", margin, gridY);
    doc.setTextColor(0, 0, 0);
    // doc.text(invoice.recipientDetails.billTo.name, margin, gridY + 5);
  // Add wrapped text for billing name
  const billingNameHeight = addWrappedText(
   doc,
    invoice.recipientDetails.billTo.name,
    margin,
    gridY + 5,
    pageWidth / 2.9 - margin - 10, // Max width for billing name
    4 // Line height
  );
    // Address label
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text("Billing Address", margin, gridY + 8 + billingNameHeight);
    doc.setTextColor(0, 0, 0);
    // doc.text(invoice.recipientDetails.billTo.address, margin, gridY + 17);
    const billingAddressHeight = addWrappedText(
     doc,
      invoice.recipientDetails.billTo.address,
      margin,
      gridY + 13 + billingNameHeight,
      pageWidth / 2.9 - margin - 10, // Max width for billing address
      4// Line height
    );
    contentY += billingNameHeight + billingAddressHeight + 10;
  }
  

  // Ship To Column
  if (invoice.recipientDetails.shipTo.name) {
    const middleX = pageWidth / 2.4 - 20;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text("Ship To", middleX, gridY);
    doc.setTextColor(0, 0, 0);
    // doc.text(invoice.recipientDetails.shipTo.name, middleX, gridY + 5);

   // Add wrapped text for shipping name
   const shippingNameHeight = addWrappedText(
   doc,
    invoice.recipientDetails.shipTo.name,
    middleX,
    gridY + 5,
    pageWidth / 2.5 - margin - 10, // Max width for shipping name
    4 // Line height
  );
    
    // Address label
    
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
   doc.text("Shipping Address", middleX, gridY + 8 + shippingNameHeight);
    doc.setTextColor(0, 0, 0);
    // doc.text(invoice.recipientDetails.shipTo.address,middleX, gridY + 17);
     // Add wrapped text for shipping address
     const shippingAddressHeight = addWrappedText(
     doc,
      invoice.recipientDetails.shipTo.address,
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
  // Only include details that have values
  const detailsData = [
    invoice.invoiceDetails.date && {
      label: "Date",
      value: new Date(invoice.invoiceDetails.date).toLocaleDateString()
    },
    invoice.invoiceDetails.paymentTerms && {
      label: "Payment Terms",
      value: invoice.invoiceDetails.paymentTerms
    },
    invoice.invoiceDetails.dueDate && {
      label: "Due Date",
      value: new Date(invoice.invoiceDetails.dueDate).toLocaleDateString()
    },
    invoice.invoiceDetails.poNumber && {
      label: "PO Number",
      value: invoice.invoiceDetails.poNumber
    },
    invoice.totals.balanceDue !== null &&
    invoice.totals.balanceDue !== undefined &&{
      label: "Balance",
      value: formatDownloadCurrency(invoice.totals.balanceDue, invoice.invoiceDetails.currency),
      color: "#DC2626"
    }
  ].filter(Boolean) as { label: string; value: string }[];

  if (detailsData.length > 0) {
    // Add gray background for details box
    doc.setFillColor(250, 250, 250);
    doc.rect(detailsX - 5, gridY - 5, 85-rightMargin, detailsData.length * 10 + 1, "F");

    detailsData.forEach((detail, index) => {
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(detail.label, detailsX, gridY + (index * 10));
      doc.setTextColor(0, 0, 0);
      doc.text(detail.value, pageWidth - margin, gridY + (index * 10), { align: "right" });
    });
  }

  

  // Items Table
  // const tableY = gridY + 60;
  const tableStartY = Math.max(
    gridY + (detailsData.length > 0 ? detailsData.length * 10 + 5 : 5),
    gridY + 30 // Minimum spacing from grid
  );
  const tableData = invoice.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.quantity.toString(),
    formatDownloadCurrency(item.rate, invoice.invoiceDetails.currency),
    formatDownloadCurrency(item.amount, invoice.invoiceDetails.currency)
  ]);

  (doc as any).autoTable({
    startY:tableStartY ,
    head: [["Sr.No", "Item", "Quantity", "Rate", "Amount"]],
    body: tableData,
    theme: "grid",
    // headStyles: { 
    //   fillColor: [242, 242, 242],
    //   textColor: [0, 0, 0],
    //   fontSize: 10
    // },
    headStyles: { fillColor: [14, 54, 94] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 40, halign: "left" },
      3: { cellWidth: 40, halign: "left" },
      4: { cellWidth: 40, halign: "left" }
    },
    styles: {
      fontSize: 9,
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });


  // Totals and Notes Section
  const finalY = (doc as any).lastAutoTable.finalY + 20;
      
  // Fixed heights for sections
  const totalsHeight = 70; // Height for totals box
  // const notesHeight = invoice.notes ? 100 : 0; // Fixed height for notes
  const notesHeight = invoice.notes ? doc.getTextDimensions(invoice.notes).h : 0
  const termsHeight = invoice.terms ? doc.getTextDimensions(invoice.terms).h : 0
  // const termsHeight = invoice.terms ? 100 : 0; // Fixed height for terms
  const totalContentHeight = Math.max(totalsHeight, notesHeight + termsHeight);
  
  const pageHeight = doc.internal.pageSize.getHeight();
  const remainingSpace = pageHeight - finalY - 10; // 20px margin
  const totalsX = pageWidth - 80;

  // Check if we need a new page
  if (totalContentHeight > remainingSpace) {
    // Add new page for all sections
    doc.addPage();
    const newPageY = 20;
    
    // Draw totals on new page
    doc.setFillColor(250, 250, 250);
    doc.rect(totalsX - 5, newPageY - 5, 85-rightMargin, totalsHeight, "F");

    const totalsData = [
      { label: "Subtotal", value: formatDownloadCurrency(invoice.totals.subtotal, invoice.invoiceDetails.currency) },
      { label: "Discount", value: formatDownloadCurrency(invoice.totals.discount, invoice.invoiceDetails.currency) },
      { label: "Tax", value: formatDownloadCurrency(invoice.totals.tax, invoice.invoiceDetails.currency) },
      { label: "Total", value: formatDownloadCurrency(invoice.totals.total, invoice.invoiceDetails.currency), bold: true },
      { label: "Amount Paid", value: formatDownloadCurrency(invoice.totals.amountPaid, invoice.invoiceDetails.currency) },
      { label: "Balance Due", value: formatDownloadCurrency(invoice.totals.balanceDue, invoice.invoiceDetails.currency), color: "#DC2626" }
    ];

    totalsData.forEach((total, index) => {
      doc.setFontSize(9);
      if (total.bold) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }
      
      if (total.color) {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(total.bold ? 0 : 128, total.bold ? 0 : 128, total.bold ? 0 : 128);
      }
      
      doc.text(total.label, totalsX, newPageY + (index * 10));
      doc.text(total.value, pageWidth - margin, newPageY + (index * 10), { align: "right" });
    });

    // Draw notes and terms
    if (invoice.notes || invoice.terms) {
      let contentY = newPageY;
      const maxWidth = totalsX - margin - 10;
      
      if (invoice.notes) {
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text("Notes", margin, contentY);
        doc.setTextColor(0, 0, 0);
        
        const noteLines = doc.splitTextToSize(invoice.notes, maxWidth);
        doc.text(noteLines, margin, contentY + 7);
        contentY += 10 + (noteLines.length * 5);
        // contentY += notesHeight;
      }
      
      if (invoice.terms) {
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text("Terms", margin, contentY + 5);
        doc.setTextColor(0, 0, 0);
        
        const termLines = doc.splitTextToSize(invoice.terms, maxWidth);
        doc.text(termLines, margin, contentY + 12);
      }
    }
  } else {
    // Draw everything on current page
    // Draw totals
    doc.setFillColor(250, 250, 250);
    doc.rect(totalsX - 5, finalY - 5, 85-rightMargin, totalsHeight, "F");

    const totalsData = [
      { label: "Subtotal", value: formatDownloadCurrency(invoice.totals.subtotal, invoice.invoiceDetails.currency) },
      { label: "Discount", value: formatDownloadCurrency(invoice.totals.discount, invoice.invoiceDetails.currency) },
      { label: "Tax", value: formatDownloadCurrency(invoice.totals.tax, invoice.invoiceDetails.currency) },
      { label: "Total", value: formatDownloadCurrency(invoice.totals.total, invoice.invoiceDetails.currency), bold: true },
      { label: "Amount Paid", value: formatDownloadCurrency(invoice.totals.amountPaid, invoice.invoiceDetails.currency) },
      { label: "Balance Due", value: formatDownloadCurrency(invoice.totals.balanceDue, invoice.invoiceDetails.currency), color: "#DC2626" }
    ];

    totalsData.forEach((total, index) => {
      doc.setFontSize(9);
      if (total.bold) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }
      
      if (total.color) {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(total.bold ? 0 : 128, total.bold ? 0 : 128, total.bold ? 0 : 128);
      }
      
      doc.text(total.label, totalsX, finalY + (index * 10));
      doc.text(total.value, pageWidth - margin, finalY + (index * 10), { align: "right" });
    });

    // Draw notes and terms
    if (invoice.notes || invoice.terms) {
      let contentY = finalY;
      const maxWidth = totalsX - margin - 10;
      
      if (invoice.notes) {
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text("Notes", margin, contentY);
        doc.setTextColor(0, 0, 0);
        
        const noteLines = doc.splitTextToSize(invoice.notes, maxWidth);
        doc.text(noteLines, margin, contentY + 7);
        // contentY += notesHeight;
        contentY += 10 + (noteLines.length * 5);
      }
      
      if (invoice.terms) {
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text("Terms", margin, contentY + 5);
        doc.setTextColor(0, 0, 0);
        
        const termLines = doc.splitTextToSize(invoice.terms, maxWidth);
        doc.text(termLines, margin, contentY + 12);
      }
    }
  }

  return doc.output("blob");
}

// Helper function to load an image as base64

// async function loadImage(url: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       if (ctx) {
//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx.drawImage(img, 0, 0);
//         resolve(canvas.toDataURL("image/jpeg"));
//       } else {
//         reject(new Error("Failed to load image."));
//       }
//     };
//     img.onerror = reject;
//     img.src = url;
//   });
// }
// import { jsPDF } from "jspdf";
// import "jspdf-autotable";
// import { InvoiceData } from "../../types/invoice";
// import { formatCurrency } from "./format-currency";

// export async function generateInvoicePDF(invoice: Omit<InvoiceData, "_id">): Promise<Blob> {
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const margin = 18;
//   let contentY = margin;
  
//   // Header Section with Logo and Invoice Number
//   const addLogo = async () => {
//     if (invoice.senderDetails.logo) {
//       const maxWidth = 50;
//       const maxHeight = 25;

//       const logoBase64: string = invoice.senderDetails.logo;
//       const img = new Image();
//       img.src = `${logoBase64}`;
//       img.crossOrigin = "anonymous"; // Prevent CORS issues

//       await new Promise<void>((resolve, reject) => {
//         img.onload = () => resolve();
//         img.onerror = () => reject(new Error("Failed to load image."));
//       });

//       // Calculate aspect ratio and dimensions
//       const aspectRatio = img.width / img.height;
//       let width = maxWidth;
//       let height = width / aspectRatio;

//       if (height > maxHeight) {
//         height = maxHeight;
//         width = height * aspectRatio;
//       }

//       // Add the image to the PDF
//       doc.addImage(img, "JPEG", margin, margin, width, height);
//       contentY += height + 4; // Adjust Y position below the image
//     }
//   };

//   // Add the logo
//   await addLogo();
  
//   // Add "From" section (below the logo)
//   doc.setFontSize(10);
//   doc.setTextColor(128, 128, 128);
//   doc.text("From:", margin, contentY);
//   doc.setTextColor(0, 0, 0);
//   doc.text(invoice.senderDetails.name, margin, contentY + 5);
  
//   // Address label
//   if (invoice.senderDetails.address) {
//   doc.setFontSize(10);
//   doc.setTextColor(128, 128, 128);
//   doc.text("Address:", margin, contentY + 12);
//   doc.setTextColor(0, 0, 0);
//   doc.text(invoice.senderDetails.address, margin, contentY + 17);
//   contentY += 13; // Move further down
//   }
//   // Invoice Number (right-aligned)
//   if (invoice.senderDetails.logo) {
//   doc.setFontSize(24);
//   doc.text(invoice.invoiceDetails.number, pageWidth - margin, margin + 20, { align: "right" });
//   }else{
//     doc.setFontSize(24);
//     doc.text(invoice.invoiceDetails.number, pageWidth - margin, margin + 10, { align: "right" });
//   }
//   // Recipient and Invoice Details Grid (3 columns)
//   const gridY = contentY + 18; // Adjust position
  
//   // Bill To Column
//   if (invoice.recipientDetails.billTo.name) {
//     doc.setFontSize(10);
//     doc.setTextColor(128, 128, 128);
//     doc.text("Bill To:", margin, gridY);
//     doc.setTextColor(0, 0, 0);
//     doc.text(invoice.recipientDetails.billTo.name, margin, gridY + 5);
  
//     // Address label
//     doc.setFontSize(10);
//     doc.setTextColor(128, 128, 128);
//     doc.text("Billing Address", margin, gridY + 12);
//     doc.setTextColor(0, 0, 0);
//     doc.text(invoice.recipientDetails.billTo.address, margin, gridY + 17);
//   }
  

//   // Ship To Column
//   if (invoice.recipientDetails.shipTo.name) {
//     const middleX = pageWidth / 2 - 20;
//     doc.setFontSize(10);
//     doc.setTextColor(128, 128, 128);
//     doc.text("Ship To", middleX, gridY);
//     doc.setTextColor(0, 0, 0);
//     doc.text(invoice.recipientDetails.shipTo.name, middleX, gridY + 5);


    
//     // Address label
    
//     doc.setFontSize(10);
//     doc.setTextColor(128, 128, 128);
//     doc.text("Shipping Address", middleX, gridY + 12);
//     doc.setTextColor(0, 0, 0);
//     doc.text(invoice.recipientDetails.shipTo.address,middleX, gridY + 17);
//   }

//   // Invoice Details Box (right column)
//   const detailsX = pageWidth - 80;
//   const rightMargin = 15;
//   // Only include details that have values
//   const detailsData = [
//     invoice.invoiceDetails.date && {
//       label: "Date",
//       value: new Date(invoice.invoiceDetails.date).toLocaleDateString()
//     },
//     invoice.invoiceDetails.paymentTerms && {
//       label: "Payment Terms",
//       value: invoice.invoiceDetails.paymentTerms
//     },
//     invoice.invoiceDetails.dueDate && {
//       label: "Due Date",
//       value: new Date(invoice.invoiceDetails.dueDate).toLocaleDateString()
//     },
//     invoice.invoiceDetails.poNumber && {
//       label: "PO Number",
//       value: invoice.invoiceDetails.poNumber
//     },
//     invoice.totals.balanceDue !== null &&
//     invoice.totals.balanceDue !== undefined &&{
//       label: "Balance",
//       value: formatCurrency(invoice.totals.balanceDue, invoice.invoiceDetails.currency),
//       color: "#DC2626"
//     }
//   ].filter(Boolean) as { label: string; value: string }[];

//   if (detailsData.length > 0) {
//     // Add gray background for details box
//     doc.setFillColor(250, 250, 250);
//     doc.rect(detailsX - 5, gridY - 5, 85-rightMargin, detailsData.length * 10 + 1, "F");

//     detailsData.forEach((detail, index) => {
//       doc.setFontSize(8);
//       doc.setTextColor(128, 128, 128);
//       doc.text(detail.label, detailsX, gridY + (index * 10));
//       doc.setTextColor(0, 0, 0);
//       doc.text(detail.value, pageWidth - margin, gridY + (index * 10), { align: "right" });
//     });
//   }

  

//   // Items Table
//   // const tableY = gridY + 60;
//   const tableStartY = Math.max(
//     gridY + (detailsData.length > 0 ? detailsData.length * 10 + 10 : 10),
//     gridY + 30 // Minimum spacing from grid
//   );
//   const tableData = invoice.items.map((item, index) => [
//     (index + 1).toString(),
//     item.description,
//     item.quantity.toString(),
//     formatCurrency(item.rate, invoice.invoiceDetails.currency),
//     formatCurrency(item.amount, invoice.invoiceDetails.currency)
//   ]);

//   (doc as any).autoTable({
//     startY:tableStartY ,
//     head: [["Sr.No", "Item", "Quantity", "Rate", "Amount"]],
//     body: tableData,
//     theme: "grid",
//     // headStyles: { 
//     //   fillColor: [242, 242, 242],
//     //   textColor: [0, 0, 0],
//     //   fontSize: 10
//     // },
//     headStyles: { fillColor: [51, 51, 51] },
//     columnStyles: {
//       0: { cellWidth: 20 },
//       1: { cellWidth: "auto" },
//       2: { cellWidth: 40, halign: "left" },
//       3: { cellWidth: 40, halign: "left" },
//       4: { cellWidth: 40, halign: "left" }
//     },
//     styles: {
//       fontSize: 9,
//       cellPadding: 2
//     },
//     alternateRowStyles: {
//       fillColor: [250, 250, 250]
//     }
//   });


//   // Totals and Notes Section
//   const finalY = (doc as any).lastAutoTable.finalY + 20;
      
//   // Fixed heights for sections
//   const totalsHeight = 70; // Height for totals box
//   const notesHeight = invoice.notes ? doc.getTextDimensions(invoice.notes).h : 0
//   const termsHeight = invoice.terms ? doc.getTextDimensions(invoice.terms).h : 0
//   // const termsHeight = invoice.terms ? 100 : 0; // Fixed height for terms
//   const totalContentHeight = Math.max(totalsHeight, notesHeight + termsHeight);
  
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const remainingSpace = pageHeight - finalY - 20; // 20px margin
//   const totalsX = pageWidth - 80;

//   // Check if we need a new page
//   if (totalContentHeight > remainingSpace) {
//     // Add new page for all sections
//     doc.addPage();
//     const newPageY = 20;
    
//     // Draw totals on new page
//     doc.setFillColor(250, 250, 250);
//     doc.rect(totalsX - 5, newPageY - 5, 85-rightMargin, totalsHeight, "F");

//     const totalsData = [
//       { label: "Subtotal", value: formatCurrency(invoice.totals.subtotal, invoice.invoiceDetails.currency) },
//       { label: "Discount", value: formatCurrency(invoice.totals.discount, invoice.invoiceDetails.currency) },
//       { label: "Tax", value: formatCurrency(invoice.totals.tax, invoice.invoiceDetails.currency) },
//       { label: "Total", value: formatCurrency(invoice.totals.total, invoice.invoiceDetails.currency), bold: true },
//       { label: "Amount Paid", value: formatCurrency(invoice.totals.amountPaid, invoice.invoiceDetails.currency) },
//       { label: "Balance Due", value: formatCurrency(invoice.totals.balanceDue, invoice.invoiceDetails.currency), color: "#DC2626" }
//     ];

//     totalsData.forEach((total, index) => {
//       doc.setFontSize(9);
//       if (total.bold) {
//         doc.setFont("helvetica", "bold");
//       } else {
//         doc.setFont("helvetica", "normal");
//       }
      
//       if (total.color) {
//         doc.setTextColor(220, 38, 38);
//       } else {
//         doc.setTextColor(total.bold ? 0 : 128, total.bold ? 0 : 128, total.bold ? 0 : 128);
//       }
      
//       doc.text(total.label, totalsX, newPageY + (index * 10));
//       doc.text(total.value, pageWidth - margin, newPageY + (index * 10), { align: "right" });
//     });

//     // Draw notes and terms
//     if (invoice.notes || invoice.terms) {
//       let contentY = newPageY;
//       const maxWidth = totalsX - margin - 10;
      
//       if (invoice.notes) {
//         doc.setFontSize(10);
//         doc.setTextColor(128, 128, 128);
//         doc.text("Notes", margin, contentY);
//         doc.setTextColor(0, 0, 0);
        
//         const noteLines = doc.splitTextToSize(invoice.notes, maxWidth);
//         doc.text(noteLines, margin, contentY + 7);
//         contentY += 10 + (noteLines.length * 5);
//         // contentY += notesHeight;
//       }
      
//       if (invoice.terms) {
//         doc.setFontSize(10);
//         doc.setTextColor(128, 128, 128);
//         doc.text("Terms", margin, contentY + 5);
//         doc.setTextColor(0, 0, 0);
        
//         const termLines = doc.splitTextToSize(invoice.terms, maxWidth);
//         doc.text(termLines, margin, contentY + 12);
//       }
//     }
//   } else {
//     // Draw everything on current page
//     // Draw totals
//     doc.setFillColor(250, 250, 250);
//     doc.rect(totalsX - 5, finalY - 5, 85-rightMargin, totalsHeight, "F");

//     const totalsData = [
//       { label: "Subtotal", value: formatCurrency(invoice.totals.subtotal, invoice.invoiceDetails.currency) },
//       { label: "Discount", value: formatCurrency(invoice.totals.discount, invoice.invoiceDetails.currency) },
//       { label: "Tax", value: formatCurrency(invoice.totals.tax, invoice.invoiceDetails.currency) },
//       { label: "Total", value: formatCurrency(invoice.totals.total, invoice.invoiceDetails.currency), bold: true },
//       { label: "Amount Paid", value: formatCurrency(invoice.totals.amountPaid, invoice.invoiceDetails.currency) },
//       { label: "Balance Due", value: formatCurrency(invoice.totals.balanceDue, invoice.invoiceDetails.currency), color: "#DC2626" }
//     ];

//     totalsData.forEach((total, index) => {
//       doc.setFontSize(9);
//       if (total.bold) {
//         doc.setFont("helvetica", "bold");
//       } else {
//         doc.setFont("helvetica", "normal");
//       }
      
//       if (total.color) {
//         doc.setTextColor(220, 38, 38);
//       } else {
//         doc.setTextColor(total.bold ? 0 : 128, total.bold ? 0 : 128, total.bold ? 0 : 128);
//       }
      
//       doc.text(total.label, totalsX, finalY + (index * 10));
//       doc.text(total.value, pageWidth - margin, finalY + (index * 10), { align: "right" });
//     });

//     // Draw notes and terms
//     if (invoice.notes || invoice.terms) {
//       let contentY = finalY;
//       const maxWidth = totalsX - margin - 10;
      
//       if (invoice.notes) {
//         doc.setFontSize(10);
//         doc.setTextColor(128, 128, 128);
//         doc.text("Notes", margin, contentY);
//         doc.setTextColor(0, 0, 0);
        
//         const noteLines = doc.splitTextToSize(invoice.notes, maxWidth);
//         doc.text(noteLines, margin, contentY + 7);
//         // contentY += notesHeight;
//         contentY += 10 + (noteLines.length * 5);
//       }
      
//       if (invoice.terms) {
//         doc.setFontSize(10);
//         doc.setTextColor(128, 128, 128);
//         doc.text("Terms", margin, contentY + 5);
//         doc.setTextColor(0, 0, 0);
        
//         const termLines = doc.splitTextToSize(invoice.terms, maxWidth);
//         doc.text(termLines, margin, contentY + 12);
//       }
//     }
//   }

//   return doc.output("blob");
// }

