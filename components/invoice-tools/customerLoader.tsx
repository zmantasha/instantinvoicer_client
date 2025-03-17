"use client"

import { useCallback, useEffect, useState } from "react";
import CustomerTable from "./customerTable";
import { useUser } from "@/hooks/UserContext";
import axios from "axios";
import Spinner from "../Spinner";
import { CloudCog } from "lucide-react";

export default function CustomerLoader(){
   const { user } = useUser();
   const [isLoading, setIsLoading] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);

      const fetchCustomer=useCallback(async()=>{

        if (!user?.user?._id) return;
        try {
          setIsLoading(true)
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/userId/${user.user._id}`
          );
          
          console.log(response)
          setCustomers(response.data || []);
          
        }catch (error) {
          console.error("Failed to fetch invoices:", error);
        }finally{
          setIsLoading(false)
        }
      },[user?.user?._id, setCustomers])

      useEffect(() => {
        fetchCustomer();
       }, [fetchCustomer]);

      if (isLoading) {
        return <Spinner loading={isLoading} color="gray" />;
      }
    
    return (
      <>
      <CustomerTable
       customers={customers}
     />
      </>
    )
}