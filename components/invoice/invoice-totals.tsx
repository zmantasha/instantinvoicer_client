

"use client";
import { currencies } from "@/lib/constants/currencies";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { formatCurrency } from "../../lib/utils/format-currency";
import React, { memo, useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

interface InvoiceTotalsProps {
  totals: {
    subtotal: number;
    tax: number;
    taxRate: number;
    taxType: string;
    shipping: number;
    discount: number;
    discountType: number;
    shippingType: string;
    total: number;
    amountPaid: number;
    balanceDue: number;
    igst: number;
    cgst: number;
    sgst: number;
  };
  currency: string;
  onUpdate: (totals: any) => void;
}

const GST_TYPES = ["IGST", "CGST+SGST"] as const;
type GstType = typeof GST_TYPES[number];

const InvoiceTotals = memo(({ totals, currency, onUpdate }: InvoiceTotalsProps) => {
  const currentCurrency = currencies.find((c) => c.value === currency);
  const isIndia = currentCurrency?.country === "India";
  // const [gstType, setGstType] = useState<GstType>(
  //   totals.igst > 0 ? "IGST" : "CGST+SGST"
  // );

  // Handle currency/tax type synchronization
  // useEffect(() => {
  //   const newTaxType = isIndia ? "GST" : "VAT";
  //   if (totals.taxType !== newTaxType) {
  //     const updatedTotals = { ...totals, taxType: newTaxType };
      
  //     // Reset tax calculations when switching tax regimes
  //     if (newTaxType === "GST") {
  //       updateGstCalculations(updatedTotals, gstType);
  //     } else {
  //       updatedTotals.tax = updatedTotals.taxRate * updatedTotals.subtotal / 100;
  //       updatedTotals.igst = 0;
  //       updatedTotals.cgst = 0;
  //       updatedTotals.sgst = 0;
  //     }
      
  //     onUpdate(updatedTotals);
  //   }
  // }, [isIndia]);

  // 1. Add useEffect to sync GST type with existing values
useEffect(() => {
  // When editing existing invoice, determine GST type from stored values
  if (totals.taxType === "GST") {
    const newGstType = totals.igst > 0 ? "IGST" : "CGST+SGST";
    if (gstType !== newGstType) {
      setGstType(newGstType);
    }
  }
}, [totals.igst, totals.cgst, totals.sgst]); // Watch GST values

// 2. Modify currency change handler to preserve existing GST type
useEffect(() => {
  const newTaxType = isIndia ? "GST" : "VAT";
  
  // Only update if tax type actually needs to change
  if (totals.taxType !== newTaxType) {
    const updatedTotals = { ...totals, taxType: newTaxType };

    if (newTaxType === "GST") {
      // Preserve existing GST type if available
      const preservedGstType = totals.igst > 0 ? "IGST" : "CGST+SGST";
      updateGstCalculations(updatedTotals, preservedGstType);
      setGstType(preservedGstType);
    } else {
      // Clear GST values for non-India currencies
      updatedTotals.tax = updatedTotals.taxRate * updatedTotals.subtotal / 100;
      updatedTotals.igst = 0;
      updatedTotals.cgst = 0;
      updatedTotals.sgst = 0;
    }
    
    onUpdate(updatedTotals);
  }
}, [isIndia]);

// 3. Update GST type state initialization
const [gstType, setGstType] = useState<GstType>(() => {
  // More accurate initial state determination
  if (totals.igst > 0) return "IGST";
  if (totals.cgst > 0 || totals.sgst > 0) return "CGST+SGST";
  return "IGST"; // Default to IGST if no values exist
});

  const handleMainTaxChange = (type: string) => {
    const newTotals = { ...totals, taxType: type };
    
    if (type === "GST") {
      updateGstCalculations(newTotals, gstType);
    } else {
      // Clear GST-specific values when switching to non-GST tax type
      newTotals.igst = 0;
      newTotals.cgst = 0;
      newTotals.sgst = 0;
      newTotals.tax = newTotals.taxRate * newTotals.subtotal / 100;
    }
    
    onUpdate(newTotals);
  };

  const updateGstCalculations = (targetTotals: typeof totals, type: GstType) => {
    const taxAmount = targetTotals.taxRate * targetTotals.subtotal / 100;
    
    if (type === "IGST") {
      targetTotals.igst = taxAmount;
      targetTotals.cgst = 0;
      targetTotals.sgst = 0;
    } else {
      // Default to CGST+SGST
      targetTotals.cgst = taxAmount / 2;
      targetTotals.sgst = taxAmount / 2;
      targetTotals.igst = 0;
    }
    
    targetTotals.tax = targetTotals.igst + targetTotals.cgst + targetTotals.sgst;
  };

  const handleGstTypeChange = (type: GstType) => {
    setGstType(type);
    const newTotals = { ...totals };
    updateGstCalculations(newTotals, type);
    onUpdate(newTotals);
  };

  const handleTaxRateChange = (rate: number) => {
    const newTotals = { ...totals, taxRate: rate };
    if (newTotals.taxType === "GST") {
      updateGstCalculations(newTotals, gstType);
    } else {
      newTotals.tax = rate * newTotals.subtotal / 100;
    }
    onUpdate(newTotals);
  };

  return (
    <div className="space-y-4">
        {/* Subtotal */}
       <div className="flex justify-between items-center text-sm">
         <span className="text-gray-600">Subtotal</span>
        <span>{formatCurrency(totals.subtotal, currency)}</span>
       </div>
      {/* Tax Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Select 
            value={totals.taxType} 
            onValueChange={handleMainTaxChange}
            key={currency} // Force re-render on currency change
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Tax Type" />
            </SelectTrigger>
            <SelectContent>
              {/* Show currency-specific tax types */}
              {currentCurrency?.taxTypes?.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                  {type === "GST" && (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                         <TooltipTrigger className="ml-2">
                           <HelpCircle className="h-4 w-4 inline-block" />
                         </TooltipTrigger>
                         <TooltipContent>
                         <p>Goods and Services Tax (India)</p>
                        </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* GST Type selector */}
          {totals.taxType === "GST" && (
            <Select 
              value={gstType} 
              onValueChange={(v: GstType) => handleGstTypeChange(v)}
              key={`gst-type-${gstType}`} // Ensure proper reset
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="GST Type" />
              </SelectTrigger>
              <SelectContent>
                {GST_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <span>{type}</span>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            {type === "IGST" && "Integrated GST (Inter-state transactions)"}
                            {type === "CGST+SGST" && "Central + State GST (Intra-state transactions)"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Tax rate input */}
          {(totals.taxType === "GST" || totals.taxType === "VAT") && (
            <>
              <Input
                type="number"
                value={totals.taxRate}
                onChange={(e) => handleTaxRateChange(Number(e.target.value))}
                className="w-24 text-right"
                min="0"
                step="0.1"
              />
              <span className="text-gray-600">%</span>
            </>
          )}
        </div>

        {/* Tax calculation displays */}
        {totals.taxType === "GST" ? (
            <div className="pl-2 border-l-4 border-blue-100 space-y-2">
                         <div className="text-sm text-muted-foreground space-y-1">
                          {gstType === "IGST" ? (
                            <div className="flex justify-between">
                              <span>IGST:</span>
                              <span>{formatCurrency(totals.igst, currency)}</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span>CGST:</span>
                                <span>{formatCurrency(totals.cgst, currency)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>SGST:</span>
                                <span>{formatCurrency(totals.sgst, currency)}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between pt-1 border-t">
                            <span className="font-medium">Total GST:</span>
                            <span className="font-medium">
                              {formatCurrency(totals.tax, currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    
        ) : (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{totals.taxType} Amount</span>
            <span>{formatCurrency(totals.tax, currency)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
       <Input
          type="number"
          value={totals.discountType}
          onChange={(e) => onUpdate({ ...totals, discountType: Number(e.target.value) })}
          className="w-20 text-right"
        />
        <span className="text-gray-600">% Discount</span>
        <span className="ml-auto">{formatCurrency(totals.discount, currency)}</span>
      </div>

      {/* Total Section */}
      <div className="pt-4 border-t">
        <div className="flex justify-between items-center font-medium">
          <span>Total</span>
          <span className="text-xl">{formatCurrency(totals.total, currency)}</span>
        </div>
      </div>

      {/* Payment Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Amount Paid</Label>
          <div className="flex items-center flex-1">
            <span className="text-gray-500">{currency}</span>
            <Input
              type="number"
              value={totals.amountPaid}
              onChange={(e) => onUpdate({ ...totals, amountPaid: Number(e.target.value) })}
              className="flex-1 text-right"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-medium">Balance Due</span>
          <span className="text-xl font-bold">{formatCurrency(totals.balanceDue, currency)}</span>
        </div>
      </div>
    </div>
  );
});
InvoiceTotals.displayName = "InvoiceTotals";
export { InvoiceTotals };