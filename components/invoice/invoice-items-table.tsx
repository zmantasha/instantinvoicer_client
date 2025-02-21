import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Plus, Trash2, FileSpreadsheet, AlertCircle, X } from "lucide-react";
import { formatCurrency, getCurrencySymbol } from "../../lib/utils/format-currency";
import { calculateItemAmount } from "../../lib/utils/invoice-calculations";
import { InvoiceItem } from "../../types/invoice";
import { useState, useRef, useEffect } from "react";
import React, { memo, useCallback } from 'react';
import {toast} from "react-toastify"
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
  const lastInputRef = useRef<HTMLInputElement>(null);

  const addHeader = () => {
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

  // const addItem = useCallback(() => {
  //   const newItem: InvoiceItem = {
  //     id: crypto.randomUUID(),
  //     data: itemHeaders.reduce((acc, header) => {
  //       acc[header] = "";
  //       return acc;
  //     }, {} as Record<string, string>),
  //     quantity: 1,
  //     rate: 0,
  //     amount: 0,
  //   };
  //   onUpdateItems([...items, newItem]);
  // }, [items, onUpdateItems, itemHeaders]);

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
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        if (field === "data") {
          return {
            ...item,
            data: value as Record<string, string>
          };
        }
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          updatedItem.amount = calculateItemAmount(
            field === "quantity" ? value as number : item.quantity,
            field === "rate" ? value as number : item.rate
          );
        }
        return updatedItem;
      }
      return item;
    });
    onUpdateItems(updatedItems);
  }, [items, onUpdateItems]);

  const removeItem = useCallback((id: string) => {
    onUpdateItems(items.filter((item) => item.id !== id));
  }, [items, onUpdateItems]);

  const handleCellPaste = (e: React.ClipboardEvent<HTMLInputElement>, id: string, field: keyof InvoiceItem) => {
    e.stopPropagation();
    const clipboardData = e.clipboardData.getData('text');
    const pastedValues = clipboardData.split(/[\n\t]/).map(v => v.trim()).filter(v => v);
    if (pastedValues.length === 0) return;
    e.preventDefault();
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    const updatedItems = [...items];
    pastedValues.forEach((value, offset) => {
      const targetIndex = currentIndex + offset;
      if (targetIndex >= updatedItems.length) {
        updatedItems.push({
          id: crypto.randomUUID(),
          data: itemHeaders.reduce((acc, header) => {
            acc[header] = "";
            return acc;
          }, {} as Record<string, string>),
          quantity: 1,
          rate: 0,
          amount: 0,
        });
      }
      const item = updatedItems[targetIndex];
      if (field === 'data') {
        updatedItems[targetIndex] = { ...item, data: { ...item.data, [itemHeaders[0]]: value } };
      } else if (field === 'quantity' || field === 'rate') {
        const numericValue = parseFloat(value) || 0;
        const updatedItem = { ...item, [field]: numericValue };
        updatedItem.amount = calculateItemAmount(
          field === 'quantity' ? numericValue : item.quantity,
          field === 'rate' ? numericValue : item.rate
        );
        updatedItems[targetIndex] = updatedItem;
      }
    });
    onUpdateItems(updatedItems);
  };
  // console.log("focusedHeaderIndex:", focusedHeaderIndex);


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
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
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {itemHeaders.map((header, index) => (
                <TableHead key={index}>
                  <div className="flex items-center gap-1">
                    <Input
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      onFocus={() => handleHeaderFocus(index)} // Handle focus
                      // onBlur={handleHeaderBlur} // Handle blur
                      placeholder="Header name"
                      className="border-transparent hover:border-input focus:border-input bg-transparent"
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
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-center">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
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
                        value={item.rate === 0 ? "" : item.rate}
                        placeholder="rate"
                        onChange={(e) => updateItem(item.id, "rate", e.target.value === "" ? "" : Number(e.target.value))}
                        onFocus={() => setFocusedCell({ rowId: item.id, column: "rate" })}
                        onPaste={(e) => handleCellPaste(e, item.id, "rate")}
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
  );
});

InvoiceItemsTable.displayName = 'InvoiceItemsTable';
export { InvoiceItemsTable };