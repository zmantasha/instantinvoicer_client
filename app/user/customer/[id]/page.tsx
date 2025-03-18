"use client"
import CustomerList from "@/components/customer/CustomerList";
import IndividualCustomerDetail from "@/components/customer/IndividualCustomerDetail";
import styles from "./customerDetails.module.css";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/hooks/UserContext";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { useParams } from "next/navigation";

export default function CustomerDetails() {
        const { user } = useUser();
        const params= useParams()
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
            },[user?.user?._id])
            
       useEffect(() => {
         fetchCustomer();
        }, [fetchCustomer]);
        
        
      if (isLoading) {
        return <Spinner loading={isLoading} color="gray" />;
      }
    return (
        <div className={styles.container}>
            {/* Customer List - Left Panel */}
            <aside className={styles.customerList}>
                <CustomerList customers={customers} activeCustomerId={params.id as string}/>
            </aside>

            {/* Customer Details - Right Panel */}
            <main className={styles.customerDetails}>
                <IndividualCustomerDetail />
            </main>
        </div>
    );
}
