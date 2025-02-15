"use client";
import { useFormik } from "formik";
import styles from "../setting.module.css"
import axios from "axios";
import { useUser } from "../../../../hooks/UserContext";
import { useEffect, useState } from "react";





interface FormValues {
    invoiceId: string;
  }

export default function Edit(){
  const { user } = useUser();
    const [latestInvoiceNumber, setLatestInvoiceNumber] = useState<string>("INV-0001");
    useEffect(()=>{
      if (user?.user._id) {
        generateInvoiceNumber();
      }
    },[user])
    const generateInvoiceNumber = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8002/api/v1/invoice/invoices/userId/${user?.user._id}`
        );
        const invoices = response.data; // Assuming this is an array
        console.log(invoices);
    
        let newInvoiceNumber = "INV-0001";  // Default if no previous invoice exists
    
        if (invoices && invoices.length > 0) {
          const latestInvoice = invoices[invoices.length - 1]; // Get the last invoice
          console.log(latestInvoice);
    
          if (latestInvoice.invoiceDetails?.number) {
             
            const lastNumber = parseInt(
              latestInvoice.invoiceDetails.number.replace("INV-", ""), // Remove prefix
              10
            );
            newInvoiceNumber = `INV-${String(lastNumber + 1).padStart(4, "0")}`;
           
          }
        }
       setLatestInvoiceNumber(newInvoiceNumber)
       
      } catch (error) {
        console.log("Error fetching invoices:", error);
      }
    };

const formik = useFormik<FormValues>({
  initialValues: {
    invoiceId: latestInvoiceNumber||"INV-0001",
  },
  enableReinitialize: true,
  onSubmit:(values) => {
    try {
    console.log(values)
    } catch (error) {
   console.log(error)
    }
  },
});
  // useEffect(()=>{
  //   if (user?.user._id) {
  //     generateInvoiceNumber();
  //   }
  // },[user])
  // const generateInvoiceNumber = async () => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:8002/api/v1/invoice/invoices/userId/${user?.user._id}`
  //     );
  //     const invoices = response.data; // Assuming this is an array
  //     console.log(invoices);
  
  //     let newInvoiceNumber = "INV-0001";  // Default if no previous invoice exists
  
  //     if (invoices && invoices.length > 0) {
  //       const latestInvoice = invoices[invoices.length - 1]; // Get the last invoice
  //       console.log(latestInvoice);
  
  //       if (latestInvoice.invoiceDetails?.number) {
  //         // formik.setFieldValue("invoiceId", latestInvoice.invoiceDetails.number);
  //         const lastNumber = parseInt(
  //           latestInvoice.invoiceDetails.number.replace("INV-", ""), // Remove prefix
  //           10
  //         );
  //         newInvoiceNumber = `INV-${String(lastNumber + 1).padStart(4, "0")}`;
  //         formik.setFieldValue("invoiceId", latestInvoice.invoiceDetails.number);
  //       }
  //     }else{
  //       formik.setFieldValue("invoiceId", newInvoiceNumber);
  //     }
  
     
  //   } catch (error) {
  //     console.log("Error fetching invoices:", error);
  //   }
  // };
  

   return (
    <>
        <div className={styles.settingContainer}>
      <div className={styles.settingCard}>
        <h2 className={styles.settingTitle}>Setting</h2>
        
              <form onSubmit={formik.handleSubmit}>
                <div className={styles.inputGroup}>
                  <label>Next Invoice Number:</label>
                  <input
                    type="text"
                    id="invoiceId"
                    name="invoiceId"
                    placeholder="Enter invoice number"
                    className={styles.input}
                    value={formik.values.invoiceId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
               
                <button type="submit" className={styles.saveButton}>
                  Save
                </button>
              </form>
             
            </div>
        </div>
    </>
   )
}