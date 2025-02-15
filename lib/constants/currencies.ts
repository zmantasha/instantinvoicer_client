export const currencies = [
  { label: "USD - US Dollar", value: "USD", symbol: "$" },
  { label: "EUR - Euro", value: "EUR", symbol: "€" },
  { label: "GBP - British Pound", value: "GBP", symbol: "£" },
  { label: "INR - Indian Rupee", value: "INR", symbol: "₹" },
  { label: "JPY - Japanese Yen", value: "JPY", symbol: "¥" },
] as const;

export type Currency = typeof currencies[number]["value"];
