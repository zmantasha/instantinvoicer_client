"use client";

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { formatCurrency } from "../../lib/utils/format-currency";
import React, { memo } from 'react';
interface InvoiceTotalsProps {
  totals: {
    subtotal: number;
    tax: number;
    taxRate: number;
    shipping: number;
    discount: number;
    discountType: number,
    shippingType: string,
    total: number;
    amountPaid: number;
    balanceDue: number;
  };
  currency: string;
  onUpdate: (totals: any) => void;
}

const InvoiceTotals = memo(({
  totals,
  currency,
  onUpdate,
}: InvoiceTotalsProps) =>{
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span>{formatCurrency(totals.subtotal, currency)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={totals.taxRate}
          onChange={(e) =>
            onUpdate({ ...totals, taxRate: Number(e.target.value) })
          }
          className="w-20 text-right"
        />
        <span className="text-gray-600">% Tax</span>
        <span className="ml-auto">{formatCurrency(totals.tax, currency)}</span>
      </div>

      {/* discount and Shipping */}

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={totals.discountType}
          onChange={(e) =>
            onUpdate({ ...totals, discountType: Number(e.target.value) })
          }
          className="w-20 text-right"
        />
        <span className="text-gray-600">% Discount</span>
        <span className="ml-auto">{formatCurrency(totals.discount, currency)}</span>
      </div>


      <div className="pt-4 border-t">
        <div className="flex justify-between items-center font-medium">
          <span>Total</span>
          <span className="text-xl">
            {formatCurrency(totals.total, currency)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Amount Paid</Label>
          <div className="flex items-center flex-1">
            <span className="text-gray-500">{currency}</span>
            <Input
              type="number"
              value={totals.amountPaid}
              onChange={(e) =>
                onUpdate({ ...totals, amountPaid: Number(e.target.value) })
              }
              className="flex-1 text-right"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-medium">Balance Due</span>
          <span className="text-xl font-bold">
            {formatCurrency(totals.balanceDue, currency)}
          </span>
        </div>
      </div>
    </div>
  );
});

InvoiceTotals.displayName = 'InvoiceTotals';
export { InvoiceTotals };
