


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Plus, Trash2, FileSpreadsheet, AlertCircle, X } from "lucide-react";
import { formatCurrency, getCurrencySymbol } from "../../lib/utils/format-currency";
import { calculateItemAmount } from "../../lib/utils/invoice-calculations";
import { InvoiceItem } from "../../types/invoice";
import { useState, useRef, useEffect } from "react";
import React, { memo, useCallback } from 'react';
import {toast} from "react-hot-toast"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { FormError } from "../ui/form-error";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  currency: string;
  itemHeaders: string[]; // Dynamic headers
  onUpdateItems: (items: InvoiceItem[]) => void;
  onUpdateItemHeaders: (headers: string[]) => void;
  formErrors: any;
  formTouched: any;
  formik: any;
}

const InvoiceItemsTable = memo(({ items, currency, itemHeaders, onUpdateItems, onUpdateItemHeaders, formErrors, formTouched,formik }: InvoiceItemsTableProps) => {
  const [focusedCell, setFocusedCell] = useState<{ rowId: string; column: string } | null>(null);
  const [focusedHeaderIndex, setFocusedHeaderIndex] = useState<number | null>(null); // Track focused header
  const [isRatePopupOpen, setIsRatePopupOpen] = useState(false);
  const [rateToApply, setRateToApply] = useState<number | null>(null);
  const [hasAskedAboutRate, setHasAskedAboutRate] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addHeader = () => {
    if (itemHeaders.length > 4) {
      toast.error("Only 5 headers are allowed!", { position: "top-right" });
      return;
    }
    const newHeader = `Header ${itemHeaders.length + 1}`;
   
    onUpdateItemHeaders([...itemHeaders, newHeader]);
  };

  // const updateHeader = (index: number, value: string) => {
  //   const updatedHeaders = [...itemHeaders];
  //   console.log(updatedHeaders);
  //   updatedHeaders[index] = value;
  //   onUpdateItemHeaders(updatedHeaders);
  // };

  // In InvoiceItemsTable component
const updateHeader = (index: number, value: string) => {
  // if (index > 4) {
  //   toast.error("Only 5 headers are allowed!", { position: "top-right" });
  //   return;
  // }
  const oldHeader = itemHeaders[index];
 
  const updatedHeaders = [...itemHeaders];
  updatedHeaders[index] = value;

  // Update items to use new header key
  const updatedItems = items.map(item => {
    const newData = { ...item.data };
    if (oldHeader in newData) {
      newData[value] = newData[oldHeader];
      delete newData[oldHeader];
    }
    return { ...item, data: newData };
  });
  

  formik.setFieldValue("itemHeaders", updatedHeaders);
  formik.setFieldValue("items", updatedItems);
};

const removeHeader = (index: number) => {
  if (itemHeaders.length === 1) {
    toast.error("At least one header is required.");
    return;
  }

  const headerToRemove = itemHeaders[index];
  const updatedHeaders = itemHeaders.filter((_, i) => i !== index);

  const updatedItems = items.map(item => {
    const newData = { ...item.data };
    delete newData[headerToRemove];
    return { ...item, data: newData };
  });

  formik.setFieldValue("itemHeaders", updatedHeaders);
  formik.setFieldValue("items", updatedItems);
  setFocusedHeaderIndex(null);
};




  const handleHeaderFocus = (index: number) => {
    setFocusedHeaderIndex(index); // Set the focused header index
  };

  // const handleHeaderBlur = () => {
  //   setFocusedHeaderIndex(index); // Reset focus when blurred
  // };


  const addItem = useCallback(() => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      data: itemHeaders.reduce((acc, header) => {
        acc[header] = "";
        return acc;
      }, {} as Record<string, string>),
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    onUpdateItems([...items, newItem]);
  }, [items, onUpdateItems, itemHeaders]);

  useEffect(() => {
    if (lastInputRef.current && items.length > 0) {
      lastInputRef.current.focus();
    }
  }, [items.length]);

  const add10Items = useCallback(() => {
    const newItems = Array.from({ length: 10 }, () => ({
      id: crypto.randomUUID(),
      data: itemHeaders.reduce((acc, header) => {
        acc[header] = "";
        return acc;
      }, {} as Record<string, string>),
      quantity: 1,
      rate: 0,
      amount: 0,
    }));
    onUpdateItems([...items, ...newItems]);
  }, [items, onUpdateItems, itemHeaders]);




  const updateItem = useCallback((id: string, field: keyof InvoiceItem, value: any) => {
    if (field === "rate") {
      const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      // const numericValue = value === "" ? "" : parseFloat(value) || 0;
      
      // Update current item first
      const updatedItems = items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, rate: numericValue };
          updatedItem.amount = calculateItemAmount(updatedItem.quantity, numericValue);
          return updatedItem;
        }
        return item;
      });
      onUpdateItems(updatedItems);
  
      // Show popup only first time
      
      if (!hasAskedAboutRate && items.length > 1) {
        const index = items.findIndex(item => item.id === id);
        console.log("index",index);
        const inputElement = inputRefs.current[index];
        if (inputElement) {
          const rect = inputElement.getBoundingClientRect();
          // Calculate position with viewport boundaries check
          const popupWidth = 300;
          const rightSpace = window.innerWidth - rect.right;
          const leftPosition = rightSpace > popupWidth ? rect.right : rect.left - popupWidth;
          
          setPopupPosition({
            top: rect.top + 40, // Position below input
            left: leftPosition,
          });
        }
        setRateToApply(numericValue);
        setIsRatePopupOpen(true);
      }
      
      return;
    
    } else {
      // Handle other field updates
      const updatedItems = items.map((item) => {
        if (item.id === id) {
          if (field === "data") {
            return { ...item, data: value as Record<string, string> };
          }
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity") {
            updatedItem.amount = calculateItemAmount(
              value as number,
              item.rate
            );
          }
          return updatedItem;
        }
        return item;
      });
      onUpdateItems(updatedItems);
    }
  }, [items, onUpdateItems, hasAskedAboutRate]);
  
  const applyRateToAll = () => {
    if (rateToApply !== null) {
      const updatedItems = items.map(item => ({
        ...item,
        rate: rateToApply,
        amount: calculateItemAmount(item.quantity, rateToApply),
      }));
      onUpdateItems(updatedItems);
    }
    setIsRatePopupOpen(false);
    setHasAskedAboutRate(true);
    setRateToApply(null);
    setPopupPosition(null);
  };

  const handleRateDecline = () => {
    setIsRatePopupOpen(false);
    setHasAskedAboutRate(true);
    setRateToApply(null);
    setPopupPosition(null);
  };


  const removeItem = useCallback((id: string) => {
    onUpdateItems(items.filter((item) => item.id !== id));
  }, [items, onUpdateItems]);



// Update handleCellPaste function signature
const handleCellPaste = (
  e: React.ClipboardEvent<HTMLInputElement>, 
  id: string, 
  field: keyof InvoiceItem,
  headerIndex?: number // Add header index parameter
) => {
  e.stopPropagation();
  const clipboardData = e.clipboardData.getData('text');
  if (!clipboardData) return;
  e.preventDefault();

  const currentIndex = items.findIndex(item => item.id === id);
  if (currentIndex === -1) return;

  const updatedItems = [...items];
  const pastedData = clipboardData.split(/[\n\t]/).map(v => v.trim()).filter(v => v);

  // Calculate how many rows we need to update/create
  const rowsToUpdate = Math.min(pastedData.length, items.length - currentIndex);

  // Update existing rows
  for (let i = 0; i < rowsToUpdate; i++) {
    const targetIndex = currentIndex + i;
    const value = pastedData[i];
    
    if (field === 'data' && typeof headerIndex !== 'undefined') {
      const currentHeader = itemHeaders[headerIndex];
      updatedItems[targetIndex] = {
        ...updatedItems[targetIndex],
        data: {
          ...updatedItems[targetIndex].data,
          [currentHeader]: value
        }
      };
    } else if (field === 'quantity' || field === 'rate') {
      const numericValue = parseFloat(value) || 0;
      updatedItems[targetIndex] = {
        ...updatedItems[targetIndex],
        [field]: numericValue,
        amount: calculateItemAmount(
          field === 'quantity' ? numericValue : updatedItems[targetIndex].quantity,
          field === 'rate' ? numericValue : updatedItems[targetIndex].rate
        )
      };
    }
  }

  // Create new rows only if we have more pasted data than existing rows
  if (pastedData.length > rowsToUpdate) {
    const newItems = pastedData.slice(rowsToUpdate).map(value => ({
      id: crypto.randomUUID(),
      data: itemHeaders.reduce((acc, header) => {
        acc[header] = field === 'data' && header === itemHeaders[headerIndex!] ? value : '';
        return acc;
      }, {} as Record<string, string>),
      quantity: field === 'quantity' ? parseFloat(value) || 1 : 1,
      rate: field === 'rate' ? parseFloat(value) || 0 : 0,
      amount: 0
    }));

    // Calculate amounts for new items
    newItems.forEach(item => {
      item.amount = calculateItemAmount(item.quantity, item.rate);
    });

    updatedItems.push(...newItems);
  }

  onUpdateItems(updatedItems);
};



// When the user presses Enter in the rate input box, move the cursor to the next input field.

 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
  if (e.key === "Enter" ||e.key==="ArrowDown") {
    e.preventDefault();
    const nextInput = inputRefs.current[index + 1];

    if (nextInput) {
      nextInput.focus();
    }
  }else if(e.key==="ArrowUp"){
    e.preventDefault();  
    const nextInput = inputRefs.current[index-1];
    if (nextInput) {
      nextInput.focus(); 
  }
  }

};

// Add this useEffect to handle window resize and scrolling
useEffect(() => {
  if (!isRatePopupOpen) return;

  const handleScrollResize = () => {
    setIsRatePopupOpen(false);
    setPopupPosition(null);
  };

  window.addEventListener('scroll', handleScrollResize, true);
  window.addEventListener('resize', handleScrollResize);

  return () => {
    window.removeEventListener('scroll', handleScrollResize, true);
    window.removeEventListener('resize', handleScrollResize);
  };
}, [isRatePopupOpen]);

  return (
    <div className="space-y-4">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={addItem} className="text-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button variant="outline" onClick={add10Items} className="text-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Add 10 Rows
          </Button>
          <Button variant="outline" onClick={addHeader} className="text-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Header
          </Button>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md cursor-help">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Paste from Excel/Sheets</span>
                <AlertCircle className="w-4 h-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>You can paste data in two ways:</p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Click any cell and paste to insert at that position</li>
                <li>Or paste anywhere to add new rows at the bottom</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              {itemHeaders.map((header, index) => (
                <TableHead key={index} className="min-w-[150px]">
                  <div className="flex items-center gap-1">
                    <Input
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      onFocus={() => handleHeaderFocus(index)} // Handle focus
                      // onBlur={handleHeaderBlur} // Handle blur
                      placeholder="Header name"
                      className="border-transparent hover:border-input focus:border-input bg-transparent w-full min-w-[120px]"
                    />
                    {focusedHeaderIndex === index &&itemHeaders.length > 1&&(
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHeader(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                        )}                
                  </div>
                  {formErrors?.itemHeaders?.[index] && formTouched?.itemHeaders?.[index] && (
                  <FormError message={formErrors.itemHeaders[index]} />
                )}
                </TableHead>
              ))}
              <TableHead className="text-right min-w-[100px]">Quantity</TableHead>
              <TableHead className="text-center min-w-[100px]">Rate</TableHead>
              <TableHead className="text-right min-w-[100px]">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={itemHeaders.length + 4} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileSpreadsheet className="w-8 h-8 mb-2" />
                    <p>No items yet</p>
                    <p className="text-sm">Add items manually or paste from Excel/Sheets</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={item.id}>
                  {itemHeaders.map((header, headerIndex) => (
                    <TableCell key={headerIndex}>
                    <Input
                      value={item.data[header] || ""}
                      onChange={(e) => updateItem(item.id, "data", { ...item.data, [header]: e.target.value })}
                      placeholder={`Enter ${header}`}
                      onPaste={(e) => handleCellPaste(e, item.id, "data", headerIndex)}
                      className="border-transparent hover:border-input focus:border-input bg-transparent"
                    />
                    <FormError 
                      message={formErrors?.items?.[index]?.data?.[header]} 
                      className={formTouched?.items?.[index]?.data?.[header] ? "block" : "hidden"} 
                    />
                  </TableCell>
                 
                  ))}
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      onFocus={() => setFocusedCell({ rowId: item.id, column: "quantity" })}
                      onPaste={(e) => handleCellPaste(e, item.id, "quantity")}
                      min="0"
                      step="1"
                      className="border-transparent hover:border-input focus:border-input bg-transparent text-right"
                    />
                    <FormError message={formErrors?.items?.[index]?.quantity} className={formTouched.items?.[index]?.quantity ? "block" : "hidden"} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-muted-foreground">{getCurrencySymbol(currency)} </span>
                      <Input
                        type="number"
                        ref={(el) => (inputRefs.current[index] = el)}
                        value={item.rate}
                        placeholder="rate"
                        step="any" // Allows decimal values
                        inputMode="decimal" // Mobile-friendly
                        onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value))}
                        onFocus={(e) => {
                          setFocusedCell({ rowId: item.id, column: "rate" });
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPopupPosition({ top: rect.bottom, left: rect.left });
                        }} 

                        onPaste={(e) => handleCellPaste(e, item.id, "rate")}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="border-transparent hover:border-input focus:border-input bg-transparent w-24 text-left"
                      />
                    </div>
                    <FormError message={formErrors?.items?.[index]?.rate} className={formTouched?.items?.[index]?.rate ? "block" : "hidden"} />
                   

                  </TableCell>

                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.amount, currency)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>

                 
                </TableRow>
              ))
            )}
          </TableBody>
          
        </Table>
        </div>
      </div>
       {/* Rate Popup */}
      
{isRatePopupOpen && popupPosition && (
  <div
    className="fixed z-50 bg-white p-4 rounded-lg rounded-sm rounded-md shadow-lg border border-gray-200"
    style={{
      top: `${Math.max(popupPosition.top, 20)}px`,
      left: `${Math.max(popupPosition.left, 20)}px`,
      maxWidth: 'calc(100vw - 40px)'
    }}
  >
    <div className="flex flex-col gap-2">
      <p className="text-sm">Apply this rate to all items?</p>
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRateDecline}
        >
          No
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={applyRateToAll}
        >
          Yes
        </Button>
      </div>
    </div>
  </div>
)}
     
    </div>
  );
});

InvoiceItemsTable.displayName = 'InvoiceItemsTable';
export { InvoiceItemsTable };