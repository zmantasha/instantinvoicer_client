"use client";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Modal } from "../ui/modal";
import { useParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useFormik } from "formik";

interface Props {
  modalOpen: boolean;
  setModalOpen: (value: boolean) => void;
  editSection:"billing" | "shipping" | null; // Specify possible values
  updateAddressLocally:any
}

// Default structure for addresses
const initialCustomerData = {
    street1: "",
    street2: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
};

export default function EditAddress({ modalOpen, setModalOpen, editSection,updateAddressLocally }: Props) {
  const [customerData, setCustomerData] = useState(initialCustomerData);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !editSection) return;
  
    const fetchCustomer = async () => {
      try {
        const accessToken = Cookies.get("accessToken");
        const headers = { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true };
  
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/${id}`, headers);
        console.log("Fetching data for:", editSection);
  
        const data = editSection === "shipping" ? response.data.shippingAddress : response.data.billingAddress;
        setCustomerData(data);
        setIsLoading(false);
      } catch (error) {
        toast.error("Failed to load customer data.");
      }
    };
  
    fetchCustomer();
  }, [id, editSection]);
  
  const formik = useFormik({
    initialValues: customerData, 
    enableReinitialize: true, 
    onSubmit: async(values) => {
        try {
             const accessToken = Cookies.get("accessToken");
            const headers = {
                headers: {
                Authorization: `Bearer ${accessToken}`,
                },
                withCredentials: true,
            };
             // Fetch existing customer details
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/${id}`, headers);
            const fullCustomerData = response.data; 
            if(fullCustomerData.createdBy){
                delete(fullCustomerData as any).createdBy
            }
            if(fullCustomerData.invoices){
                delete(fullCustomerData as any).invoices
            }
            // Merge existing customer details with new address
            const updatedCustomerData = {
            ...fullCustomerData,  // Keep existing firstName, lastName, etc.
            [editSection === "billing" ? "billingAddress" : "shippingAddress"]: values, // Update only the address
            };
             await axios.put(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/${id}`, updatedCustomerData, headers);       
            toast.success("Address updated successfully!");
            updateAddressLocally(values)
            setModalOpen(false); 
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

  const handleCloseModal = () => {
    setModalOpen(false);
    setCustomerData(initialCustomerData)
    // setCustomerData(initialCustomerData); // Reset form fields
    formik.resetForm(); // Reset Formik state
  };
  
  return (
    <Modal open={modalOpen} onClose={handleCloseModal}>
      <h2 className="text-lg font-semibold mb-3">
        Edit {editSection === "billing" ? "Billing" : "Shipping"} Address
      </h2>
  
      {isLoading ? (
        <p>Loading...</p> // ✅ Show loading state instead of an empty form
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Street1</Label>
              <Input
                name="street1"
                value={formik.values.street1 || ""}
                onChange={formik.handleChange}
                placeholder="Enter Your Address 1"
              />
  
              <Label>Street2</Label>
              <Input
                name="street2"
                value={formik.values.street2 || ""}
                onChange={formik.handleChange}
                placeholder="Enter Your Address 2"
              />
  
              <Label>City</Label>
              <Input
                name="city"
                value={formik.values.city || ""}
                onChange={formik.handleChange}
                placeholder="Enter City"
              />
  
              <Label>State</Label>
              <Input
                name="state"
                value={formik.values.state || ""}
                onChange={formik.handleChange}
                placeholder="Enter State"
              />
  
              <Label>PinCode</Label>
              <Input
                name="pinCode"
                value={formik.values.pinCode || ""}
                onChange={formik.handleChange}
                placeholder="Enter Pin Code"
              />
  
              <Label>Country</Label>
              <Input
                name="country"
                value={formik.values.country || ""}
                onChange={formik.handleChange}
                placeholder="Enter Country"
              />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md">
            Save Address
          </button>
        </form>
      )}
    </Modal>
  );
  
}
