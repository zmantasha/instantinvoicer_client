export const currencies = [
  { label: "US Dollar", value: "USD", symbol: "$" },
  { label: "Euro", value: "EUR", symbol: "€" },
  { label: "British Pound", value: "GBP", symbol: "£" },
  { label: "Indian Rupee", value: "INR", symbol: "₹" },
  { label: "Japanese Yen", value: "JPY", symbol: "¥" },
] as const;

export type Currency = typeof currencies[number]["value"];
