export const currencies = [
  { label: "USD - US Dollar", value: "USD", symbol: "$" , country: "USA", taxTypes: ["VAT", "No GST"]},
  { label: "EUR - Euro", value: "EUR", symbol: "€",   country: "EUR",taxTypes: ["VAT", "No GST"] },
  { label: "INR - Indian Rupee", value: "INR", symbol: "₹" , country: "India",  taxTypes: ["GST", "No GST"]},
  { label: "JPY - Japanese Yen", value: "JPY", symbol: "¥",  country: "JPY", taxTypes: ["VAT", "No GST"] },
  { label: "GBP - British Pound", value: "GBP", symbol: "£",  country: "GBP",taxTypes: ["VAT", "No GST"] },
  
] as const;

export type Currency = typeof currencies[number]["value"];