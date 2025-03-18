"use client"
import CustomerList from "@/components/customer/CustomerList";
import IndividualCustomerDetail from "@/components/customer/IndividualCustomerDetail";
import styles from "./customerDetails.module.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@/hooks/UserContext";
import axios from "axios";
import { useParams } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function CustomerDetails() {
    const { user } = useUser();
    const { id } = useParams(); // Get customer ID from URL

    // Fetch customer list ONLY on first load


    return (
            <main>
                {id ? <IndividualCustomerDetail customerId={id as string} /> : <p>Select a customer to view details</p>}
            </main>    
    );
}
