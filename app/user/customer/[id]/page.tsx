"use client"
import IndividualCustomerDetail from "@/components/customer/IndividualCustomerDetail";
import styles from "./customerDetails.module.css";
import { useParams } from "next/navigation";


export default function CustomerDetails() {
    const { id } = useParams(); // Get customer ID from URL

    // Fetch customer list ONLY on first load


    return (
            <main className={styles.customerDetails}>
                {id ? <IndividualCustomerDetail customerId={id as string} /> : <p>Select a customer to view details</p>}
            </main>    
    );
}
