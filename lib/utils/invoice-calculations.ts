// Utils for Calculation
export function calculateItemAmount(quantity: number, rate: number): number {
  return quantity * rate;
}

export function calculateSubtotal(items: Array<{ amount: number }>): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return (subtotal * taxRate) / 100;
}

export function calculateDiscount(
  subtotal: number,
  discountType:number,
): number {
  return  (subtotal * discountType) / 100 ;
}

export function calculateShipping(
  subtotal: number,
  shipping: number,
  shippingType: "percentage" | "fixed"
): number {
  return shippingType === "percentage" ? (subtotal * shipping) / 100 : shipping;
}

export function calculateTotal(
  subtotal: number,
  tax: number,
  discount: number,
  shipping: number
): number {
  return subtotal + tax - discount+ shipping;
}
