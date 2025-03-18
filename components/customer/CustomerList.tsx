"use client"
import { useState } from "react";
import styles from "../../app/user/customer/[id]/customerDetails.module.css"
import Spinner from "../Spinner";
import { Button } from "../ui/button"
import { usePathname, useRouter } from "next/navigation";
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
      const pathname = usePathname();
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
                 onClick={() => router.push(`/user/customer/${customer._id}`)} >
                {customer.firstName}
                </li>
                
               ))}
               </ul>
           </div>
        </>
    )
}










// balanceDue
// : 
// 0
// billingAddress
// : 
// {street1: 'NAGAR PANCHAYAT MEWDAN (ASWA ROAD) HANDIA, ALLAHABAD', street2: '', city: 'Prayagraj', state: 'Uttar Pradesh', pinCode: '221503', …}
// companyName
// : 
// ""
// contacts
// : 
// []
// createdAt
// : 
// "2025-03-17T18:35:08.407Z"
// createdBy
// : 
// {_id: '67a06ce4ea771beb35efb64b', firstName: 'Test', lastName: 'zubair', email: 'test@gmail.com', is_verified: false, …}
// creditLimit
// : 
// 0
// currency
// : 
// "USD"
// customerType
// : 
// "individual"
// displayName
// : 
// "mantasha"
// email
// : 
// "mantasha@gmail.com"
// firstName
// : 
// "mantasha"
// invoices
// : 
// []
// lastName
// : 
// "xyz"
// mobilePhone
// : 
// "7897744166"
// notes
// : 
// ""
// shippingAddress
// : 
// {street1: '', street2: '', city: '', state: '', pinCode: '', …}
// status
// : 
// "active"
// taxId
// : 
// null
// totalPaid
// : 
// 0
// updatedAt
// : 
// "2025-03-17T18:35:08.407Z"
// workPhone
// : 
// "7897744166"
// __v
// : 
// 0
// _id
// : 
// "67d86b5c520d679ed6ec880b"