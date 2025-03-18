"use client"
import { useState } from "react";
import styles from "../../app/user/customer/[id]/customerDetails.module.css"
import Spinner from "../Spinner";
import { Button } from "../ui/button"
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
interface customers{
    _id:string;
    firstName:string;
}

interface customersTableProps{
    customers:customers[];
    activeCustomerId?: string;
}
export default function CustomerList({customers ,activeCustomerId}:customersTableProps){
     const [isLoading, setIsLoading] = useState(false);
      const router= useRouter()
      const handleNavigate=(type:string)=>{    
        router.push(`/user/customer/${type}`)
      }
      if (isLoading) {
        return <Spinner loading={isLoading} color="gray" />;
      }
    return (
        <>
           <div className={styles.listHeader}>
                <div className={styles.listFilter}>All Customer List</div>
                <Button variant="outline"
                 className="text-white bg-[#0c69cc] hover:bg-[#0f7fe6] hover:text-white px-2 py-0" 
                 onClick={()=>handleNavigate("add")}>
                <Plus />
                </Button>
           </div>
           <div className={styles.columnContent}>
               <ul>
               {customers.map((customer, index) => (
                 <li
                 key={customer._id}
                 className={`${styles.listItem} ${customer._id === activeCustomerId ? styles.active : ""}`}
                 onClick={() => handleNavigate(customer._id)} >
                {customer.firstName}
                </li>
                
               ))}
               </ul>
           </div>
        </>
    )
}