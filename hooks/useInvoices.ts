"use client"
import { useState, useEffect } from "react";
import axios from "axios";
export function useInvoices(userId:string){
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the invoices are already cached in sessionStorage
    const cachedInvoices = sessionStorage.getItem(`invoices_${userId}`);
    
    if (cachedInvoices) {
      // If data is found in cache, use it
      setInvoices(JSON.parse(cachedInvoices));
      setLoading(false);
    } else {
      // If no cached data, fetch from the API
      axios
        .get(`http://localhost:8002/api/v1/invoice/invoices/userId/${userId}`)
        .then((response) => {
          const fetchedInvoices = response.data;
          setInvoices(fetchedInvoices);
          
          // Cache the fetched data
          sessionStorage.setItem(`invoices_${userId}`, JSON.stringify(fetchedInvoices));
          
          setLoading(false);
        })
        .catch((error) => {
          setError(error.message || "Failed to load invoices");
          setLoading(false);
        });
    }
  }, [userId]);
  
    return {invoices,loading,error}
}