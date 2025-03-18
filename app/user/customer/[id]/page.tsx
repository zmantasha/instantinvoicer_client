"use client"
import CustomerList from "@/components/customer/CustomerList";
import IndividualCustomerDetail from "@/components/customer/IndividualCustomerDetail";
import styles from "./customerDetails.module.css";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/hooks/UserContext";
import axios from "axios";
import { useParams } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function CustomerDetails() {
    const { user } = useUser();
    const { id } = useParams(); // Get customer ID from URL
    const [isLoading, setIsLoading] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);

    // Fetch customer list ONLY on first load
    const fetchCustomers = useCallback(async () => {
        if (!user?.user?._id) return;
        try {
            setIsLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/userId/${user.user._id}`
            );
            setIsLoading(false)
            setCustomers(response.data || []);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        } 
    }, [user?.user?._id,setCustomers]);

    // Fetch customer list ONLY when the page loads
    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]); // Empty dependency array ensures it runs only once

    if (isLoading) {
        return <Spinner loading={isLoading} color="gray" />;
    }

    return (
        <div className={styles.container}>
            {/* Customer List - Left Panel (Does NOT refresh on click) */}
            <aside className={styles.customerList}>
                <CustomerList customers={customers} activeCustomerId={id as string} />
            </aside>

            {/* Customer Details - Right Panel (Updates when ID changes) */}
            <main className={styles.customerDetails}>
                {id ? <IndividualCustomerDetail customerId={id as string} /> : <p>Select a customer to view details</p>}
            </main>
        </div>
    );
}
