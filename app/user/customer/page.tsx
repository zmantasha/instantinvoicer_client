"use client"

import { Button } from "@/components/ui/button";
import styles from "./customer.module.css"
import CustomerLoader  from  "../../../components/invoice-tools/customerLoader" 
import { useRouter } from "next/navigation";
export default function Customer() {

  const router= useRouter()
  const handleNavigate=()=>{
    router.push("/user/customer/add")
  }
  return (
    <div className={styles.myCustomerPage}>
    <div className={styles.myCustomerContainer}>
    <div className={styles.customerCard}>
      {/* Header */}
      <div className={styles.customerHeader}>
        <h2 className={styles.customerTitle}>Customers</h2>
        <Button className="bg-blue-600 hover:bg-[#0f7fe6] text-white px-4 py-2 rounded-md" onClick={handleNavigate}>Add New Customer</Button>
      </div>

      {/* Table */}
    <div className={styles.customerContainer}>
     <CustomerLoader/>
     </div>
     </div>
     </div>
    </div>
  );
}
