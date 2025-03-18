"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../Spinner";
import styles from "../../app/user/customer/[id]/customerDetails.module.css"; // Import CSS module
import { Button } from "../ui/button";
import { ChevronDown, Plus, Settings, X} from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  customerId: string;
}

export default function IndividualCustomerDetail({ customerId }: Props) {
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [addressToggle,setAddressToggle]= useState(false)
  const router= useRouter()
  // Fetch customer details when customerId changes
  useEffect(() => {
    if (!customerId) return;

    const fetchCustomerDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/${customerId}`
        );
        setCustomer(response.data);
      } catch (error) {
        console.error("Failed to fetch customer details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customerId]);
  console.log(customer)

  const handleNavigate=(type:string)=>{    
    router.push(`/user/customer/${type}`)
  }
  if (isLoading) return <Spinner loading={isLoading} color="gray" />;

  if (!customer)
    return (
      <div className={styles.notFound}>
        Customer not found.
      </div>
    );


  return (
      <>
      <div className={styles.header}>
        <div className={styles.customerInfo}>
          <h2>{customer.firstName} {customer.lastName}</h2>
          <p className={styles.email}>{customer.email}</p>
        </div>
        <div className={styles.leftHeader}>
        <Button variant="outline"
                 className="text-black bg-gray-200 hover:bg-gray-400 hover:text-white px-2 py-0" 
                 onClick={()=>handleNavigate("add")}>
                Edit
        </Button>
        <Button variant="outline"
                 className="text-white bg-[#0c69cc] hover:bg-[#0f7fe6] hover:text-white px-2 py-0" 
                 onClick={()=>handleNavigate("add")}>
                <Plus /> New Transection
        </Button>

        <X onClick={()=>router.push("/user/customer")}/>
          </div>       
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabs}>
        {["overview", "orders", "notes"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${
              activeTab === tab ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
      <div className={styles.overview}>
        {activeTab === "overview" && (
          <>
          
          <div className={styles.contentHeader}>
          <p>{customer.firstName}</p>
          <Settings onClick={()=>handleNavigate("")}/>
          </div>
         
         <div className={styles.dropdowndown}>
         <p>Address</p>
          <ChevronDown className="text-[#0c69cc]" onClick={()=>setAddressToggle(!addressToggle)}/>
         </div>
        {addressToggle && (
          <>
          <div>
           <p>Billing Address</p> 
         </div>
          <div>
           <p>Shipping Address</p> 
         </div>
         </>
        )}
         <div className={styles.dropdowndown}>
         <p>Other Details</p>
          <ChevronDown className="text-[#0c69cc]" onClick={()=>handleNavigate("")}/>
         </div>
         <div className={styles.dropdowndown}>
         <p>Contact Person</p>
          <ChevronDown className="text-[#0c69cc]" onClick={()=>handleNavigate("")}/>
         </div>

{/* 
          <div className={styles.details}>
            <p><strong>Company:</strong> {customer.company}</p>
            <p><strong>Phone:</strong> {customer.phone}</p>
            <p><strong>Customer Type:</strong> {customer.type}</p>
            <p><strong>Status:</strong> {customer.status}</p>
          </div> */}
          
          </>
        )}
        </div>
        {activeTab === "orders" && <p className={styles.noData}>No orders available.</p>}
        {activeTab === "notes" && <p className={styles.noData}>No notes added yet.</p>}
      </div>
      </>
  );
}
