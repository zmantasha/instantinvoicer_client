"use client"
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "../../app/user/customer/add/addcustomer.module.css";
import { Addcustomer } from "@/validation/schemas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "../../components/ui/button";
import {toast} from "react-hot-toast"
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import {useRouter } from "next/navigation";
import { FiCopy, FiPlus, FiTrash2, FiUser, FiMapPin, FiBriefcase, FiUsers, FiCheck, FiAlertCircle } from "react-icons/fi";

export interface contactInfo{
    name:string;
    email:string;
    workPhone:string;
    mobilePhone:string;
    designation:string;
}

const initialCustomerData={
  customerType: "",
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
  workPhone: "",
  mobilePhone: "",
  billingAddress: {
    street1: "",
    street2: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
  },
  shippingAddress: {
    street1: "",
    street2: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
  },
  companyName: "",
  taxId: "",
  currency: "USD",
  creditLimit: 0,
  notes: "",
  contacts: [] as contactInfo[],
  status: "active",
};
interface props{
  paramsId?: any;
  customerInvoicePath?: string;
  setModalOpen:(value:boolean)=>void;
  handleSelectCustomer: (customer: any) => void;
}

export default function AddCustomer({ paramsId, customerInvoicePath,setModalOpen,handleSelectCustomer }: props ){
  const [customerData,setCustomerData]= useState(initialCustomerData)
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const router = useRouter()
  
  // Fetch customer data when editing
  useEffect(() => {
      if (paramsId) {
          setIsLoading(true);
          const fetchCustomer = async () => {
              try {
                  const accessToken = Cookies.get("accessToken");
                  const headers = { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true };
                  
                  const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/${paramsId}`, headers);
                  const updatedData={...response.data}
                  if(updatedData.createdBy){
                      delete(updatedData as any).createdBy
                  }
                  setCustomerData(updatedData); // Set form data with existing customer info
              } catch (error) {
                  toast.error("Failed to load customer data.");
              } finally {
                  setIsLoading(false);
              }
          };
          fetchCustomer();
      }
  }, [paramsId]);
  
  // Formik form setup
  const formik = useFormik({
    initialValues:customerData, 
    enableReinitialize: true, // Important to update form values when customerData changes
    validationSchema:Addcustomer,
    onSubmit: async(values) => {
      let customerData = { ...values };

      // Remove taxId if customerType is "individual"
      if (customerData.customerType === "individual") {
        delete (customerData as any).taxId;
      }

      // Remove invoices array when updating a customer
      if (paramsId) {
        delete (customerData as any).invoices;
      }

      try {
         setIsLoading(false)
          const accessToken = Cookies.get("accessToken");
            const headers = {
                headers: {
                Authorization: `Bearer ${accessToken}`,
                },
                withCredentials: true,
            };
        
            if (paramsId) {
                // If editing, send PUT request
                await axios.put(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/${paramsId}`, customerData, headers);
                toast.success("Customer updated successfully!");
                setIsLoading(true)
                router.replace(`/user/customer/${paramsId}`)
            } else {
                // If creating, send POST request
             const response=  await axios.post(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer`,customerData,headers)
             const customerId=response.data?.customer?._id
             const customer=response.data?.customer
                toast.success("Customer added successfully!");
                setIsLoading(true)
                if(customerInvoicePath){
                  setModalOpen(false)
                  handleSelectCustomer(customer)
                  router.replace(`/user/${customerInvoicePath}`)
                }else{
                router.replace(`/user/customer/${customerId}`)
                }
            }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message, {
            position: "bottom-right",
          });
        } else {
          toast.error('Something went wrong. Please try again.', {
            position: "bottom-right",
          });
        }
        console.error(error)
      }
    },
  });

  // Add or remove contact persons dynamically
  const handleAddContact = () => {
    formik.setFieldValue("contacts", [
      ...formik.values.contacts,
      { name: "", email: "", workPhone: "", mobilePhone: "", designation: "" },
    ]);
  };

  const handleRemoveContact = (index:any) => {
    const contacts = [...formik.values.contacts];
    contacts.splice(index, 1);
    formik.setFieldValue("contacts", contacts);
  };

  // Copy billing address to shipping address
  const copyBillingToShipping = () => {
    formik.setFieldValue("shippingAddress", {...formik.values.billingAddress});
    toast.success("Billing address copied to shipping address");
  };

  // Handle step navigation
  const nextStep = () => {
    // Validate current step before proceeding
    if (activeStep === 1) {
      if (!formik.values.customerType || !formik.values.firstName || !formik.values.lastName || !formik.values.email) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (activeStep === 2) {
      if (!formik.values.billingAddress.street1 || !formik.values.billingAddress.city || 
          !formik.values.billingAddress.state || !formik.values.billingAddress.pinCode || 
          !formik.values.billingAddress.country) {
        toast.error("Please fill in all required billing address fields");
        return;
      }
    } else if (activeStep === 3 && formik.values.customerType === "business") {
      if (!formik.values.companyName || !formik.values.taxId) {
        toast.error("Please fill in all required business fields");
        return;
      }
    }
    
    setActiveStep(prev => Math.min(prev + 1, formik.values.customerType === "individual" ? 3 : 4));
  };

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  // Check if form is valid
  const isFormValid = () => {
    // Basic validation
    if (!formik.values.customerType || !formik.values.firstName || !formik.values.lastName || !formik.values.email) {
      return false;
    }
    
    // Address validation
    if (!formik.values.billingAddress.street1 || !formik.values.billingAddress.city || 
        !formik.values.billingAddress.state || !formik.values.billingAddress.pinCode || 
        !formik.values.billingAddress.country) {
      return false;
    }
    
    // Business validation (only if customer type is business)
    if (formik.values.customerType === "business") {
      if (!formik.values.companyName || !formik.values.taxId) {
        return false;
      }
    }
    
    return true;
  };

  if (isLoading) {
    return <Spinner loading={isLoading} color="gray" />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{paramsId ? "Edit Customer" : "Add Customer"}</h1>
      
      {/* Progress Indicator */}
      <div className={styles.progressContainer}>
        <div className={`${styles.progressStep} ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
          {activeStep > 1 ? <FiCheck /> : '1'}
        </div>
        <div className={styles.progressLabel}>Basic Info</div>
        
        <div className={`${styles.progressStep} ${activeStep >= 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
          {activeStep > 2 ? <FiCheck /> : '2'}
        </div>
        <div className={styles.progressLabel}>Address</div>
        
        <div className={`${styles.progressStep} ${activeStep >= 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`}>
          {activeStep > 3 ? <FiCheck /> : '3'}
        </div>
        <div className={styles.progressLabel}>Business</div>
        
        {formik.values.customerType === "business" && (
          <>
            <div className={`${styles.progressStep} ${activeStep >= 4 ? 'active' : ''}`}>
              4
            </div>
            <div className={styles.progressLabel}>Contacts</div>
          </>
        )}
      </div>
      
      <form onSubmit={formik.handleSubmit} className={styles.form}>
        {/* Step 1: Basic Information */}
        {activeStep === 1 && (
          <div className={styles.section}>
            <h2><FiUser className="mr-2" /> Basic Information</h2>
            <div className={styles.formGroup}>
              <Label>Customer Type <span className={styles.required}>*</span></Label>
              <select
                name="customerType"
                value={formik.values.customerType}
                onChange={(e) => {
                  formik.handleChange(e);
                  // Reset step if changing from business to individual
                  if (e.target.value === "individual" && activeStep > 3) {
                    setActiveStep(3);
                  }
                }}
                onBlur={formik.handleBlur}
                className="w-full"
              >
                <option value="">Select</option>
                <option value="business">Business</option>
                <option value="individual">Individual</option>
              </select>
              {formik.touched.customerType && formik.errors.customerType ? (
                <div className={styles.error}>{formik.errors.customerType}</div>
              ) : null}
            </div>
            <div className={styles.sectiongroup}>
              <div className={styles.formGroup}>
                <Label>Firstname <span className={styles.required}>*</span></Label>
                <Input
                  type="text"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter first name"
                />
                {formik.touched.firstName && formik.errors.firstName ? (
                  <div className={styles.error}>{formik.errors.firstName}</div>
                ) : null}
              </div>
              <div className={styles.formGroup}>
                <Label>Lastname <span className={styles.required}>*</span></Label>
                <Input
                  type="text"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter last name"
                />
                {formik.touched.lastName && formik.errors.lastName ? (
                  <div className={styles.error}>{formik.errors.lastName}</div>
                ) : null}
              </div>
            </div>
            <div className={styles.formGroup}>
              <Label>Display Name</Label>
              <Input
                type="text"
                name="displayName"
                value={formik.values.displayName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter display name"
              />
              {formik.touched.displayName && formik.errors.displayName ? (
                <div className={styles.error}>{formik.errors.displayName}</div>
              ) : null}
            </div>
            <div className={styles.formGroup}>
              <Label>Email <span className={styles.required}>*</span></Label>
              <Input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter email address"
              />
              {formik.touched.email && formik.errors.email ? (
                <div className={styles.error}>{formik.errors.email}</div>
              ) : null}
            </div>
            <div className={styles.sectiongroup}>
              <div className={styles.formGroup}>
                <Label>Work Phone</Label>
                <Input
                  type="text"
                  name="workPhone"
                  value={formik.values.workPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter work phone"
                />
              </div>
              <div className={styles.formGroup}>
                <Label>Mobile Phone</Label>
                <Input
                  type="text"
                  name="mobilePhone"
                  value={formik.values.mobilePhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter mobile phone"
                />
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <Button 
                type="button" 
                onClick={nextStep}
                className="bg-[#0c69cc] hover:bg-[#0f7fe6] text-white"
                disabled={!formik.values.customerType || !formik.values.firstName || !formik.values.lastName || !formik.values.email}
              >
                Next: Address Information
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Address Information */}
        {activeStep === 2 && (
          <div className={styles.section}>
            <h2><FiMapPin className="mr-2" /> Address Information</h2>
            <div className={styles.sectiongroup}>
              <div>
                <h3>Billing Address</h3>
                <div className={styles.formGroup}>
                  <Label>Street 1 <span className={styles.required}>*</span></Label>
                  <Input
                    type="text"
                    name="billingAddress.street1"
                    value={formik.values.billingAddress.street1}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter street address"
                  />
                  {formik.touched.billingAddress?.street1 && formik.errors.billingAddress?.street1 ? (
                    <div className={styles.error}>{formik.errors.billingAddress.street1}</div>
                  ) : null}
                </div>
                <div className={styles.formGroup}>
                  <Label>Street 2</Label>
                  <Input
                    type="text"
                    name="billingAddress.street2"
                    value={formik.values.billingAddress.street2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter apartment, suite, etc."
                  />
                </div>
                <div className={styles.sectiongroup}>
                  <div className={styles.formGroup}>
                    <Label>City <span className={styles.required}>*</span></Label>
                    <Input
                      type="text"
                      name="billingAddress.city"
                      value={formik.values.billingAddress.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter city"
                    />
                    {formik.touched.billingAddress?.city && formik.errors.billingAddress?.city ? (
                      <div className={styles.error}>{formik.errors.billingAddress.city}</div>
                    ) : null}
                  </div>
                  <div className={styles.formGroup}>
                    <Label>State <span className={styles.required}>*</span></Label>
                    <Input
                      type="text"
                      name="billingAddress.state"
                      value={formik.values.billingAddress.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter state"
                    />
                    {formik.touched.billingAddress?.state && formik.errors.billingAddress?.state ? (
                      <div className={styles.error}>{formik.errors.billingAddress.state}</div>
                    ) : null}
                  </div>
                </div>
                <div className={styles.sectiongroup}>
                  <div className={styles.formGroup}>
                    <Label>Pin Code <span className={styles.required}>*</span></Label>
                    <Input
                      type="text"
                      name="billingAddress.pinCode"
                      value={formik.values.billingAddress.pinCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter pin code"
                    />
                    {formik.touched.billingAddress?.pinCode && formik.errors.billingAddress?.pinCode ? (
                      <div className={styles.error}>{formik.errors.billingAddress.pinCode}</div>
                    ) : null}
                  </div>
                  <div className={styles.formGroup}>
                    <Label>Country <span className={styles.required}>*</span></Label>
                    <Input
                      type="text"
                      name="billingAddress.country"
                      value={formik.values.billingAddress.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter country"
                    />
                    {formik.touched.billingAddress?.country && formik.errors.billingAddress?.country ? (
                      <div className={styles.error}>{formik.errors.billingAddress.country}</div>
                    ) : null}
                  </div>
                </div>
              </div>
              
              <div>
                <h3>Shipping Address</h3>
                <button 
                  type="button" 
                  className={styles.copyAddressButton}
                  onClick={copyBillingToShipping}
                >
                  <FiCopy /> Copy Billing Address
                </button>
                <div className={styles.formGroup}>
                  <Label>Street 1 <span className={styles.required}>*</span></Label>
                  <Input
                    type="text"
                    name="shippingAddress.street1"
                    value={formik.values.shippingAddress.street1}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter street address"
                  />
                  {formik.touched.shippingAddress?.street1 && formik.errors.shippingAddress?.street1 ? (
                    <div className={styles.error}>{formik.errors.shippingAddress.street1}</div>
                  ) : null}
                </div>
                <div className={styles.formGroup}>
                  <Label>Street 2</Label>
                  <Input
                    type="text"
                    name="shippingAddress.street2"
                    value={formik.values.shippingAddress.street2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter apartment, suite, etc."
                  />
                </div>
                <div className={styles.sectiongroup}>
                  <div className={styles.formGroup}>
                    <Label>City <span className={styles.required}>*</span></Label>
                    <Input
                      type="text"
                      name="shippingAddress.city"
                      value={formik.values.shippingAddress.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter city"
                    />
                    {formik.touched.shippingAddress?.city && formik.errors.shippingAddress?.city ? (
                      <div className={styles.error}>{formik.errors.shippingAddress.city}</div>
                    ) : null}
                  </div>
                  <div className={styles.formGroup}>
                    <Label>State <span className={styles.required}>*</span></Label>
                    <Input
                      type="text"
                      name="shippingAddress.state"
                      value={formik.values.shippingAddress.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter state"
                    />
                    {formik.touched.shippingAddress?.state && formik.errors.shippingAddress?.state ? (
                      <div className={styles.error}>{formik.errors.shippingAddress.state}</div>
                    ) : null}
                  </div>
                </div>
                <div className={styles.sectiongroup}>
                  <div className={styles.formGroup}>
                    <Label>Pin Code <span className={styles.required}>*</span></Label>
                    <Input
                      type="text"
                      name="shippingAddress.pinCode"
                      value={formik.values.shippingAddress.pinCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter pin code"
                    />
                    {formik.touched.shippingAddress?.pinCode && formik.errors.shippingAddress?.pinCode ? (
                      <div className={styles.error}>{formik.errors.shippingAddress.pinCode}</div>
                    ) : null}
                  </div>
                  <div className={styles.formGroup}>
                    <Label>Country <span className={styles.required}>*</span></Label>
                    <Input
                      type="text"
                      name="shippingAddress.country"
                      value={formik.values.shippingAddress.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter country"
                    />
                    {formik.touched.shippingAddress?.country && formik.errors.shippingAddress?.country ? (
                      <div className={styles.error}>{formik.errors.shippingAddress.country}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <Button 
                type="button" 
                onClick={prevStep}
                variant="outline"
                className="mr-2"
              >
                Back: Basic Information
              </Button>
              <Button 
                type="button" 
                onClick={nextStep}
                className="bg-[#0c69cc] hover:bg-[#0f7fe6] text-white"
                disabled={!formik.values.billingAddress.street1 || !formik.values.billingAddress.city || 
                         !formik.values.billingAddress.state || !formik.values.billingAddress.pinCode || 
                         !formik.values.billingAddress.country}
              >
                Next: {formik.values.customerType === "business" ? "Business Details" : "Status"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Business Details or Status for Individual */}
        {activeStep === 3 && (
          <div className={styles.section}>
            {formik.values.customerType === "business" ? (
              <>
                <h2><FiBriefcase className="mr-2" /> Business Details</h2>
                <div className={styles.formGroup}>
                  <Label>Company Name <span className={styles.required}>*</span></Label>
                  <Input
                    type="text"
                    name="companyName"
                    value={formik.values.companyName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter company name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <Label>Tax ID <span className={styles.required}>*</span></Label>
                  <Input
                    type="text"
                    name="taxId"
                    value={formik.values.taxId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter tax ID"
                  />
                </div>
                <div className={styles.sectiongroup}>
                  <div className={styles.formGroup}>
                    <Label>Currency</Label>
                    <select
                      name="currency"
                      value={formik.values.currency}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <Label>Credit Limit</Label>
                    <Input
                      type="number"
                      name="creditLimit"
                      value={formik.values.creditLimit}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter credit limit"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <Label>Notes</Label>
                  <textarea
                    name="notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter any additional notes"
                    className="w-full"
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <Button 
                    type="button" 
                    onClick={prevStep}
                    variant="outline"
                    className="mr-2"
                  >
                    Back: Address Information
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="bg-[#0c69cc] hover:bg-[#0f7fe6] text-white"
                    disabled={!formik.values.companyName || !formik.values.taxId}
                  >
                    Next: Contact Persons
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2><FiUser className="mr-2" /> Status</h2>
                <div className={styles.formGroup}>
                  <Label>Status</Label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className={`${styles.statusBadge} ${formik.values.status === 'active' ? styles.active : styles.inactive}`}>
                    {formik.values.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className={styles.buttonGroup}>
                  <Button 
                    type="button" 
                    onClick={prevStep}
                    variant="outline"
                    className="mr-2"
                  >
                    Back: Address Information
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#0c69cc] hover:bg-[#0f7fe6] text-white" 
                    isLoading={formik.isSubmitting}
                    disabled={!isFormValid()}
                  >
                    {paramsId ? "Update Customer" : "Create Customer"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Contact Persons (Business only) */}
        {activeStep === 4 && formik.values.customerType === "business" && (
          <div className={styles.section}>
            <h2><FiUsers className="mr-2" /> Contact Persons</h2>
            {formik.values.contacts.length === 0 ? (
              <div className={styles.sectionDivider}>
                <span>No contact persons added yet</span>
              </div>
            ) : (
              formik.values.contacts.map((contact, index) => (
                <div key={index} className={styles.contactGroup}>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemoveContact(index)}
                  >
                    <FiTrash2 />
                  </button>
                  <div className={styles.sectiongroup}>
                    <div className={styles.formGroup}>
                      <Label>Name</Label>
                      <Input
                        type="text"
                        name={`contacts[${index}].name`}
                        value={contact.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter contact name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        name={`contacts[${index}].email`}
                        value={contact.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter contact email"
                      />
                    </div>
                  </div>
                  <div className={styles.sectiongroup}>
                    <div className={styles.formGroup}>
                      <Label>Work Phone</Label>
                      <Input
                        type="text"
                        name={`contacts[${index}].workPhone`}
                        value={contact.workPhone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter work phone"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <Label>Mobile Phone</Label>
                      <Input
                        type="text"
                        name={`contacts[${index}].mobilePhone`}
                        value={contact.mobilePhone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter mobile phone"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <Label>Designation</Label>
                    <Input
                      type="text"
                      name={`contacts[${index}].designation`}
                      value={contact.designation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter designation"
                    />
                  </div>
                </div>
              ))
            )}
            <button 
              type="button" 
              className={styles.addButton} 
              onClick={handleAddContact}
            >
              <FiPlus className="mr-2" /> Add Contact Person
            </button>
            
            {/* Status */}
            <div className={styles.sectionDivider}>
              <span>Status</span>
            </div>
            <div className={styles.formGroup}>
              <Label>Status</Label>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className={`${styles.statusBadge} ${formik.values.status === 'active' ? styles.active : styles.inactive}`}>
                {formik.values.status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <Button 
                type="button" 
                onClick={prevStep}
                variant="outline"
                className="mr-2"
              >
                Back: Business Details
              </Button>
              <Button 
                type="submit" 
                className="bg-[#0c69cc] hover:bg-[#0f7fe6] text-white" 
                isLoading={formik.isSubmitting}
                disabled={!isFormValid()}
              >
                {paramsId ? "Update Customer" : "Create Customer"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
