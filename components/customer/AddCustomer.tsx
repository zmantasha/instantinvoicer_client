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
import { useRouter } from "next/navigation";

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
  createdBy:"",
  notes: "",
  contacts: [] as contactInfo[],
  status: "active",
};



export default function AddCustomer({ paramsId }: { paramsId?:any }){
  const [customerData,setCustomerData]= useState(initialCustomerData)
  const [isLoading, setIsLoading] = useState(false);
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
      // console.log("Form submitted:", values);
      let customerData = { ...values };

      // Remove taxId if customerType is "individual"
      if (customerData.customerType === "individual") {
        delete (customerData as any).taxId;
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
               await axios.post(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer`,customerData,headers)
                toast.success("Customer added successfully!");
                setIsLoading(true)
                router.replace("/user/customer")
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
      // Handle form submission (e.g., API call to save customer)
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

  if (isLoading) {
    return <Spinner loading={isLoading} color="gray" />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{paramsId ? "Edit Customer" : "Add Customer"}</h1>
      <form onSubmit={formik.handleSubmit} className={styles.form}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h2>Basic Information</h2>
          <div className={styles.formGroup}>
            <Label>Customer Type</Label>
            <select
              name="customerType"
              value={formik.values.customerType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
            <Label>Firstname</Label>
            <Input
              type="text"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.firstName && formik.errors.firstName ? (
              <div className={styles.error}>{formik.errors.firstName}</div>
            ) : null}
          </div>
          <div className={styles.formGroup}>
            <Label>Lastname</Label>
            <Input
              type="text"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
            />
            {formik.touched.displayName && formik.errors.displayName ? (
              <div className={styles.error}>{formik.errors.displayName}</div>
            ) : null}
          </div>
          <div className={styles.formGroup}>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
            />
          </div>
          </div>
        </div>

        {/* Address Information */}
        <div className={styles.section}>
          <h2>Address Information</h2>
          <div className={styles.sectiongroup}>
        <div>
            <h3>Billing Address - </h3>
          <div className={styles.formGroup}>
            <Label>Street 1</Label>
            <Input
              type="text"
              name="billingAddress.street1"
              value={formik.values.billingAddress.street1}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
            />
          </div>
          <div className={styles.formGroup}>
            <Label>City</Label>
            <Input
              type="text"
              name="billingAddress.city"
              value={formik.values.billingAddress.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.billingAddress?.city && formik.errors.billingAddress?.city ? (
              <div className={styles.error}>{formik.errors.billingAddress.city}</div>
            ) : null}
          </div>
          <div className={styles.formGroup}>
            <Label>State</Label>
            <Input
              type="text"
              name="billingAddress.state"
              value={formik.values.billingAddress.state}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.billingAddress?.state && formik.errors.billingAddress?.state ? (
              <div className={styles.error}>{formik.errors.billingAddress.state}</div>
            ) : null}
          </div>
          <div className={styles.formGroup}>
            <Label>Pin Code</Label>
            <Input
              type="text"
              name="billingAddress.pinCode"
              value={formik.values.billingAddress.pinCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.billingAddress?.pinCode && formik.errors.billingAddress?.pinCode ? (
              <div className={styles.error}>{formik.errors.billingAddress.pinCode}</div>
            ) : null}
          </div>
          <div className={styles.formGroup}>
            <Label>Country</Label>
            <Input
              type="text"
              name="billingAddress.country"
              value={formik.values.billingAddress.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.billingAddress?.country && formik.errors.billingAddress?.country ? (
              <div className={styles.error}>{formik.errors.billingAddress.country}</div>
            ) : null}
          </div>
          </div>
          {/* Repeat similar fields for Shipping Address */}
       
          <div>
            <h3>Shipping Address</h3>
          <div className={styles.formGroup}>
            <Label>Street 1</Label>
            <Input
              type="text"
              name="shippingAddress.street1"
              value={formik.values.shippingAddress.street1}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
            />
          </div>
          <div className={styles.formGroup}>
            <Label>City</Label>
            <Input
              type="text"
              name="shippingAddress.city"
              value={formik.values.shippingAddress.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.shippingAddress?.city && formik.errors.shippingAddress?.city ? (
              <div className={styles.error}>{formik.errors.shippingAddress.city}</div>
            ) : null}
          </div>
          <div className={styles.formGroup}>
            <Label>State</Label>
            <Input
              type="text"
              name="shippingAddress.state"
              value={formik.values.shippingAddress.state}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.shippingAddress?.state && formik.errors.shippingAddress?.state ? (
              <div className={styles.error}>{formik.errors.shippingAddress.state}</div>
            ) : null}
          </div>
          <div className={styles.formGroup}>
            <Label>Pin Code</Label>
            <Input
              type="text"
              name="shippingAddress.pinCode"
              value={formik.values.shippingAddress.pinCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.shippingAddress?.pinCode && formik.errors.shippingAddress?.pinCode ? (
              <div className={styles.error}>{formik.errors.shippingAddress.pinCode}</div>
            ) : null}
          </div>
          <div className={styles.formGroup}>
            <Label>Country</Label>
            <Input
              type="text"
              name="shippingAddress.country"
              value={formik.values.shippingAddress.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.shippingAddress?.country && formik.errors.shippingAddress?.country ? (
              <div className={styles.error}>{formik.errors.shippingAddress.country}</div>
            ) : null}
          </div>
          </div>
          </div>
          </div>
          {/* Repeat similar fields for Shipping Address */}
       
      

        {/* Business Details */}
        {formik.values.customerType === "business" && (
          <div className={styles.section}>
            <h2>Business Details</h2>
            <div className={styles.formGroup}>
              <Label>Company Name</Label>
              <Input
                type="text"
                name="companyName"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            <div className={styles.formGroup}>
              <Label>Tax ID</Label>
              <Input
                type="text"
                name="taxId"
                value={formik.values.taxId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            <div className={styles.formGroup}>
              <Label>Currency</Label>
              <select
                name="currency"
                value={formik.values.currency}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
              />
            </div>
            <div className={styles.formGroup}>
              <Label>Notes</Label>
              <textarea
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>
        )}

        {/* Contact Persons */}
        {formik.values.customerType === "business" && (
          <div className={styles.section}>
            <h2>Contact Persons</h2>
            {formik.values.contacts.map((contact, index) => (
              <div key={index} className={styles.contactGroup}>
                <div className={styles.formGroup}>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    name={`contacts[${index}].name`}
                    value={contact.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
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
                  />
                </div>
                <div className={styles.formGroup}>
                  <Label>Work Phone</Label>
                  <Input
                    type="text"
                    name={`contacts[${index}].workPhone`}
                    value={contact.workPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
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
                  />
                </div>
                <div className={styles.formGroup}>
                  <Label>Designation</Label>
                  <Input
                    type="text"
                    name={`contacts[${index}].designation`}
                    value={contact.designation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveContact(index)}
                >
                  Remove Contact
                </button>
              </div>
            ))}
            <button type="button" className={styles.addButton} onClick={handleAddContact}>
              Add Contact
            </button>
          </div>
        )}

        {/* Status */}
        <div className={styles.section}>
          <h2>Status</h2>
          <div className={styles.formGroup}>
            <Label>Status</Label>
            <select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className={styles.buttonGroup}>
            <Button type="submit" variant="default"  className="text-white bg-[#0c69cc] hover:bg-[#0f7fe6] hover:text-white" isLoading={formik.isSubmitting}>
            {paramsId ? "Update Customer" : "Create Customer"}
            </Button>
            
          </div>
      </form>
    </div>
  );
};
