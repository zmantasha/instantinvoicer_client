"use client"
import AddCustomer from "@/components/customer/AddCustomer";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCustomer(){
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const handleSelectCustomer = (customer: any) => {
    // After adding a customer, navigate to the customer list page
    router.push("/user/customer");
  };

  return (
    <>
       <AddCustomer 
         setModalOpen={setModalOpen} 
         handleSelectCustomer={handleSelectCustomer}
       />
    </>
  )
}