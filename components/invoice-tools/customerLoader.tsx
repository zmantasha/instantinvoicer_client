"use client"

import { useCallback, useEffect, useState } from "react";
import CustomerTable from "./customerTable";
import { useUser } from "@/hooks/UserContext";
import axios from "axios";
import Spinner from "../Spinner";

export default function CustomerLoader(){
   const { user } = useUser();
   const [isLoading, setIsLoading] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);

      const fetchCustomer=useCallback(async()=>{
        if (!user?.user?._id) return;
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/${user.user._id}`
          );
          setCustomers(response.data || []);
        }catch (error) {
          console.error("Failed to fetch invoices:", error);
        } finally {
          setIsLoading(false);
        }
      },[])

      useEffect(() => {
        fetchCustomer();
       }, [fetchCustomer]);

      if (isLoading) {
        return <Spinner loading={isLoading} color="teal" />;
      }
    
    return (
      <>
      <CustomerTable
       customers={customers}
     />
      </>
    )
}