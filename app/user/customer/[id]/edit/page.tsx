"use client"
import AddCustomer from "@/components/customer/AddCustomer";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditCustomer(){
    const {id}= useParams();
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    
    if (!id || Array.isArray(id)) return <p>Invalid customer ID</p>;
    
    const handleSelectCustomer = (customer: any) => {
        // This function is required by the component but not used in edit mode
        console.log("Customer selected:", customer);
    };
    
    return (
        <>
        <AddCustomer 
            paramsId={id}
            setModalOpen={setModalOpen}
            handleSelectCustomer={handleSelectCustomer}
        />
        </>
    )
}