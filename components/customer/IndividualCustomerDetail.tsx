"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Spinner from "../Spinner";
import styles from "../../app/user/customer/[id]/customerDetails.module.css"; // Import CSS module
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp, Edit, FileText, Phone, PhoneCall, Plus, Settings, Smartphone, Trash, X} from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { FiTrash2 } from "react-icons/fi";
import { Modal } from "../ui/modal";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import EditAddress from "./EditAddress";

interface Props {
  customerId: string;
}

export default function IndividualCustomerDetail({ customerId }: Props) {
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [addressToggle,setAddressToggle]= useState(true)
  const [otherToggle,setOtherToggle]= useState(true)
  const [contactToggle,setContactToggle]= useState(true)
  const[toggleDropdown,setToggleDropdown]=useState(false)
  const [modalOpen, setModalOpen] = useState(false);
  const [editSection, setEditSection] = useState<"billing" | "shipping" | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const router= useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateAddressLocally = (updatedAddress:any) => {
    setCustomer((prev:any) => ({
      ...prev,
      [editSection === "billing" ? "billingAddress" : "shippingAddress"]: updatedAddress,
    }));
  };

  const EditAddressMemoize = useMemo(() => {
    return <EditAddress modalOpen={modalOpen} setModalOpen={setModalOpen} editSection={editSection} updateAddressLocally={updateAddressLocally}/>;
  }, [modalOpen, editSection]);
 useEffect(() => {
  const handleClickOutside = (event:MouseEvent) => {
    if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
      setToggleDropdown(false);
  }
  };
  console.log("hello")
  document.addEventListener("click", handleClickOutside);
  return () => {
      document.removeEventListener("click", handleClickOutside);
  };
}, [toggleDropdown]);


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

    // modal section
    const openModal = (section: "billing" | "shipping") => {
      setEditSection(section);
      // setFormData(customer[`${section}Address`]); // Load data into form
      setModalOpen(true)
    };

    // Close dropdown when clicking outside
    const handleDelete = async (id: string) => {
      try {
        const accessToken = Cookies.get("accessToken");
          const headers = {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          };
        await axios.delete(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/${id}`,headers
        );
       handleNavigate("/")
      } catch (error) {
        console.error("Failed to delete invoice:", error);
      }
    };

    const confirmDelete = () => {
      if (deleteItemId) {
        handleDelete(deleteItemId);
        setDeleteItemId(null);
      }
    };
  
    const handleCancelDelete = () => {
      setDeleteItemId(null);
    };

 
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
                 onClick={()=>handleNavigate(`${customer._id}/edit`)}>
                Edit
        </Button>

        {/* update here redirection invoice tamplate */}
        <Button variant="outline"
                 className="text-white bg-[#0c69cc] hover:bg-[#0f7fe6] hover:text-white px-2 py-0" 
                 onClick={()=>handleNavigate("add")}>
                <Plus /> New Transection
        </Button>
        <div className={styles.dropdownContainer}>
        {/* more button */}
        <Button variant="outline"
                 className=" text-black bg-gray-200  px-2 py-0 " 
                 onClick={()=>setToggleDropdown(!toggleDropdown)}>
                 More
                 {toggleDropdown ? (
                    <ChevronUp className="text-black w-4 h-4" />
                ) : (
                    <ChevronDown className="text-black w-4 h-4" />
                )}
        </Button>



        {/* Dropdown Menu */}
        {toggleDropdown && (
          <div ref={dropdownRef} className={styles.dropdownMenu}> 
           <div className={styles.dropdownArrow}></div>
                {/* <div className={styles.dropdown}> */}
                    <ul>
                        <li
                            onClick={() => {
                                handleNavigate("add")
                                setToggleDropdown(false);
                            }}
                        >
                            <FileText className="w-4 h-4 mr-2 text-blue-600" />
                            Invoice
                        </li>
                        <li
                            className={styles.delete}
                            onClick={() => {
                             setDeleteItemId(customer._id)
                                setToggleDropdown(false);
                            }}
                        >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                        </li>
                    </ul>
                {/* </div> */}
                </div>
            )}
         </div>
        <X onClick={()=>router.push("/user/customer")}/>
          </div>       
      </div>

       {deleteItemId === customer._id && (
              <div className={styles.modalOverlay}>
              <div className={styles.confirmationModal}>
                <FiTrash2 size={32} className={styles.modalIcon} />
                <h3>Delete Account</h3>
                <p>
                  Warning: Deleting this customer account will also remove all associated invoices.  
                  This action is irreversible. Are you sure you want to proceed?
                </p>
                <div className={styles.modalActions}>
                  <Button variant="secondary" onClick={handleCancelDelete}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete}>
                    Confirm Delete
                  </Button>
                </div>
              </div>
            </div>
           )}

      {/* Tab Navigation */}
      <div className={styles.tabs}>
        {["overview", "Transection", "notes"].map((tab) => (
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
          <div className={styles.basicDetails}>
          <p>{customer.firstName} {customer.lastName}</p>
          <p>{customer.email}</p>
          <p className={styles.contactPhone}><Phone className="text-[#333] w-4 h-4"/>{customer.workPhone}</p>
          <p className={styles.contactPhone}><Smartphone className="text-[#333] w-4 h-4"/>{customer.mobilePhone}</p>
          </div>
          <Settings className="text-gray-500 w-4 h-4" onClick={()=>handleNavigate("")}/>
          </div>
         
         <div className={styles.dropdowndown}>
         <p>Address</p>
          {!addressToggle ?<ChevronDown className="text-[#0c69cc]" onClick={()=>setAddressToggle(!addressToggle)}/>:
            <ChevronUp className="text-[#0c69cc]" onClick={()=>setAddressToggle(!addressToggle)}/>}
         </div>
        {addressToggle && (
          <>
          <div className={styles.addressHeader}>
            {/* billing Address */}
          <div>
           <p>Billing Address:</p> 
         </div>
          {/* edit icon */}
          <Edit className="text-gray-500 w-4 h-4" onClick={()=>openModal("billing")}/>
         </div>
         {/* billing details */}
         <div className={styles.details}>
          <p>{customer.billingAddress.street1}</p>
          <p>{customer.billingAddress.street2}</p>
          <p>{customer.billingAddress.city}</p>
          <p>{customer.billingAddress.state}</p>
          <p>{customer.billingAddress.pinCode}</p>
          <p>{customer.billingAddress.country}</p>
         </div>
         <div className={styles.addressHeader}>
          {/* shipping Address */}
          <div>
           <p>Shipping Address:</p> 
         </div>
          {/* Edit icon  */}
          <Edit className="text-gray-500 w-4 h-4" onClick={()=>openModal("shipping")}/>
         </div>

          {/* billing details */}
          <div className={styles.details}>
          <p>{customer.shippingAddress.street1}</p>
          <p>{customer.shippingAddress.street2}</p>
          <p>{customer.shippingAddress.city}</p>
          <p>{customer.shippingAddress.state}</p>
          <p>{customer.shippingAddress.pinCode}</p>
          <p>{customer.shippingAddress.country}</p>
         </div>
         </>
        )}

        {/* other details */}
         <div className={styles.dropdowndown}>
         <p>Other Details</p>
          {!otherToggle?<ChevronDown className="text-[#0c69cc]" onClick={()=>setOtherToggle(!otherToggle)}/>:
            <ChevronUp className="text-[#0c69cc]" onClick={()=>setOtherToggle(!otherToggle)}/>}
         </div>
         {otherToggle && (
          <>
           <div className={styles.otherDetails}>
          <p><strong>Customer Type</strong> {customer.customerType}</p>
          {customer.customerType==="business" && (
            <>
            <p><strong>Company Name</strong> {customer.companyName}</p>
            <p><strong>TaxId</strong> {customer.taxId}</p>
            {customer.creditLimit && <p><strong>Credit Limit</strong> {customer.creditLimit}</p>}

            </>
          )}
          <p><strong>Default Currency</strong> {customer.currency}</p>
          <p><strong>Work Phone</strong> {customer.workPhone}</p>
          <p><strong>Mobile Phone</strong> {customer.mobilePhone}</p>
          <p><strong>Status</strong> <span className={`px-2 py-1 text-sm rounded-full ${customer.status === "active" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"}`}>{customer.status}</span></p>
         </div>

         </>
         )}
          {/* contact Info */}
         <div className={styles.dropdowndown}>
         <p>Contact Person</p>
          {!contactToggle?<ChevronDown className="text-[#0c69cc]" onClick={()=>setContactToggle(!contactToggle)}/>:
            <ChevronUp className="text-[#0c69cc]" onClick={()=>setContactToggle(!contactToggle)}/>}
         </div>
         {contactToggle && (
           <>
           <div className={styles.otherDetails}>
          {customer.customerType==="business" ? (
            <>
            {customer?.contacts?.map((contact:any,index:any)=>(
              <div key={index}>
             <div  className={styles.addressHeader}>
             {/* billing Address */}
              <div >
                <p>Contacts:{index+1} </p> 
              </div> 
             </div>
            {contact.name &&<p><strong>Name</strong> {contact.name}</p>}
            {/* in future fix capital issue (email) */}
            {contact.email &&<p><strong>Email</strong> {contact.email}</p>}
            {contact.workPhone && <p><strong>Work Phone</strong> {contact.workPhone}</p>}
            {contact.mobilePhone && <p><strong>Mobile Phone</strong> {contact.mobilePhone}</p>}
            {contact.designation && <p><strong>Designation</strong> {contact.designation}</p>}
            </div>
            ))}
      

            </>): (
            <>
            <p className={styles.noData}>No contact persons found.</p>
            </>
          )}
         </div>

         </>
         )}
          
          </>
        )}
        </div>
        {activeTab === "Transection" && <p className={styles.noData}>No Transection available.</p>}
        {activeTab === "notes" && <p className={styles.noData}>No notes added yet.</p>}
      </div>

      {EditAddressMemoize}
      {/* <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
      <h2 className="text-lg font-semibold mb-3">
          Edit {editSection === "billing" ? "Billing" : "Shipping"} Address
        </h2>
        <div className="space-y-4">
        <div className="grid  gap-2 items-center">
        <Label>Street1</Label>
        <Input 
       
        placeholder="Enter Your Address 1"
        />

        <Label>Street2</Label>
        <Input 
       
        placeholder="Enter Your Address 1"
        />

        <Label>City</Label>
        <Input
        
        placeholder="Enter Your Address 1"
        />

        <Label>State</Label>
        <Input 
       
        placeholder="Enter Your Address 1"
        />

        <Label>PinCode</Label>
        <Input
      
        placeholder="Enter Your Address 1"
        />

        <Label>Country</Label>
        <Input
        
        placeholder="Enter Your Address 1"
        />
        </div>
        </div>
      </Modal> */}
      </>
  );
}
