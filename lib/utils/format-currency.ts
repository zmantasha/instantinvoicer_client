
import { currencies } from "../constants/currencies";

// Cache to store currency symbols
const currencyCache: { [key: string]: string } = {};

// Function to get only the currency symbol
export function getCurrencySymbol(currencyCode: string): string {
  // Check if the currency symbol is already cached
  let symbol = currencyCache[currencyCode];
  if (!symbol) {
    // If not cached, find the currency symbol and store it in the cache
    const currency = currencies.find((c) => c.value === currencyCode);
    symbol = currency?.symbol || "$";
    currencyCache[currencyCode] = symbol;
  }
  return symbol;
}

// Function to format currency with symbol and amount
export function formatCurrency(amount: number | undefined, currencyCode: string): string {
  if (amount === undefined || isNaN(amount)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
    }).format(0);
  }

  const symbol = getCurrencySymbol(currencyCode);

  let formattedCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // Add a space between the currency symbol and the amount
  formattedCurrency = formattedCurrency.replace(/(\D)(\d)/, "$1 $2");

  return formattedCurrency;
}

// Function to format currency for download invoices (e.g., replacing ₹ with Rs)
export function formatDownloadCurrency(amount: number | undefined, currencyCode: string): string {
  if (amount === undefined || isNaN(amount)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
    }).format(0);
  }

  let symbol = getCurrencySymbol(currencyCode);

  let formattedDownloadCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // Replace only the INR symbol with 'Rs'
  if (currencyCode === "INR") {
    formattedDownloadCurrency = formattedDownloadCurrency.replace("₹", "Rs");
  }

  // Add a space between the currency symbol and the amount
  formattedDownloadCurrency = formattedDownloadCurrency.replace(/(\D)(\d)/, "$1 $2");

  return formattedDownloadCurrency;
}









// import { currencies } from "../constants/currencies";
// // Cache to store currency symbols
// const currencyCache: { [key: string]: string } = {};
// export function formatCurrency(amount: number | undefined, currencyCode: string): string {
//   if (amount === undefined || isNaN(amount)) {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: currencyCode || 'USD',
//     }).format(0);
//   }

//   // Check if the currency symbol is already cached
//   let symbol = currencyCache[currencyCode];
//   if (!symbol) {
//     // If not cached, find the currency symbol and store it in the cache
//     const currency = currencies.find((c) => c.value === currencyCode);
//     symbol = currency?.symbol || "$";
//     currencyCache[currencyCode] = symbol;
//   }

//   // Format the amount
//   let formattedCurrency = new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: currencyCode || 'USD',
//     currencyDisplay: 'symbol',
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(amount);

//   // // Replace only the INR symbol with 'Rs'
//   // if (currencyCode === 'INR') {
//   //   formattedCurrency = formattedCurrency.replace('₹', 'Rs');
//   // }
//  // Add a space between the currency symbol and the amount
//  formattedCurrency = formattedCurrency.replace(/(\D)(\d)/, '$1 $2');
//   return formattedCurrency;
// }
// export function formatDownloadCurrency(amount: number | undefined, currencyCode: string): string {
//   if (amount === undefined || isNaN(amount)) {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: currencyCode || 'USD',
//     }).format(0);
//   }

//   // Check if the currency symbol is already cached
//   let symbol = currencyCache[currencyCode];
//   if (!symbol) {
//     // If not cached, find the currency symbol and store it in the cache
//     const currency = currencies.find((c) => c.value === currencyCode);
//     symbol = currency?.symbol || "$";
//     currencyCache[currencyCode] = symbol;
//   }

//   // Format the amount
//   let formattedDownloadCurrency = new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: currencyCode || 'USD',
//     currencyDisplay: 'symbol',
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(amount);

//   // // Replace only the INR symbol with 'Rs'
//   if (currencyCode === 'INR') {
//     formattedDownloadCurrency = formattedDownloadCurrency.replace('₹', 'Rs');
//   }
//  // Add a space between the currency symbol and the amount
//  formattedDownloadCurrency = formattedDownloadCurrency.replace(/(\D)(\d)/, '$1 $2');
//   return formattedDownloadCurrency;
// }

