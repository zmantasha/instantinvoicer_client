import { useCallback, useEffect, useState, useMemo } from "react";
import { InvoiceData } from "../types/invoice";
import { generateInvoicePDF } from "../lib/utils/pdf-generator";
import { toast } from "react-toastify";
import {
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
  calculateShipping,
} from "../lib/utils/invoice-calculations";
import axios from "axios";
import { useUser } from "./UserContext";
import { useFormik } from 'formik';
import { FormikErrors } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

const initialInvoiceData: Omit<InvoiceData, '_id'> = {
  userId: "",
  senderDetails: {
    logo: "",
    name: "",
    address: "",
  },
  recipientDetails: {
    billTo: {
      name: "",
      address: "",
    },
    shipTo: {
      name: "",
      address: "",
    },
  },
  invoiceDetails: {
    number: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    paymentTerms: "",
    poNumber: "",
    currency: "USD",
  },
  itemHeaders: ["description"],
  items: [],
  totals: {
    subtotal: 0,
    tax: 0,
    taxRate: 0,
    // taxType: "VAT",
    shipping: 0,
    discount: 0,
    discountType: 0,
    shippingType: "percentage",
    total: 0,
    amountPaid: 0,
    balanceDue: 0,
  },
  notes: "",
  terms: "",
};

const cleanMongoFields = (data: any): any => {
  const cleaned = { ...data };
  delete cleaned._id;
  delete cleaned.__v;

  if (Array.isArray(cleaned.items)) {
    cleaned.items = cleaned.items.map((item: any) => {
      const cleanedItem = { ...item };
      delete cleanedItem._id;
      delete cleanedItem.__v;
      if (cleanedItem.data) {
        delete cleanedItem.data._id;
        delete cleanedItem.data.__v;
      }
      return cleanedItem;
    });
  }
  return cleaned;
};

const getEmptyFields = (errors: FormikErrors<InvoiceData>) => {
  const emptyFieldMessages = [];

  if (errors.senderDetails?.name) emptyFieldMessages.push('Business Name is required');
  if (errors.senderDetails?.address) emptyFieldMessages.push('Business Address is required');
  if (errors.recipientDetails?.billTo?.name) emptyFieldMessages.push('Bill To Name is required');
  if (errors.recipientDetails?.billTo?.address) emptyFieldMessages.push('Bill To Address is required');
  if (errors.invoiceDetails?.number) emptyFieldMessages.push('Invoice Number is required');
  if (errors.invoiceDetails?.date) emptyFieldMessages.push('Invoice Date is required');
  if (errors.invoiceDetails?.dueDate) emptyFieldMessages.push('Due Date is required');

  if (errors.items && Array.isArray(errors.items)) {
    errors.items.forEach((itemError: any, index: number) => {
      if (itemError?.quantity) emptyFieldMessages.push(`Item ${index + 1}: Quantity is required`);
      if (itemError?.rate) emptyFieldMessages.push(`Item ${index + 1}: Rate is required`);
      if (itemError?.data) {
        Object.keys(itemError.data).forEach(field => {
          emptyFieldMessages.push(`Item ${index + 1}: ${field} is required`);
        });
      }
    });
  }

  return emptyFieldMessages;
};

export function useInvoice(initialData?: InvoiceData) {
  const { user } = useUser();
  const router = useRouter();
  const getInitialValues = useMemo(() => {
    if (!initialData) return initialInvoiceData;
  
    // Extract headers from itemHeaders or from first item's data if available
    const headers = initialData.itemHeaders && initialData.itemHeaders.length > 0
      ? initialData.itemHeaders
      : initialData.items.length > 0
        ? Object.keys(initialData.items[0].data).filter(key => key !== '_id' && key !== '__v')
        : ["description"];
  
    // Process items to ensure they have all headers
    const processedItems = initialData.items.map(item => {
      const data: Record<string, string> = {};
      headers.forEach(header => {
        data[header] = item.data[header] || "";
      });
  
      return {
        id: item.id || crypto.randomUUID(),
        data,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount
      };
    });
  
    return {
      ...initialInvoiceData,
      ...initialData,
      invoiceDetails: {
        ...initialData.invoiceDetails,
        number: initialData.invoiceDetails.number,
        date: new Date(initialData.invoiceDetails.date).toISOString().split('T')[0],
        dueDate: new Date(initialData.invoiceDetails.dueDate).toISOString().split('T')[0],
      },
      itemHeaders: headers,
      items: processedItems
    };
  }, [initialData]);
  

  const validationSchema = useMemo(() => {
    return Yup.object({
      senderDetails: Yup.object({
        name: Yup.string()
          .max(50, "Sender Name must be at most 50 characters")
          .required("Business name is required"),
        address: Yup.string()
          .max(60, "Sender Address must be at most 60 characters")
          .required("Business address is required"),
      }),
      recipientDetails: Yup.object({
        billTo: Yup.object({
          name: Yup.string()
            .max(50, "Billing Name must be at most 50 characters")
            .required("Recipient name is required"),
          address: Yup.string()
            .max(60, "Billing Address must be at most 60 characters")
            .required("Billing address is required"),
        }),
        shipTo: Yup.object({
          name: Yup.string().max(50, "Shipping Name must be at most 50 characters"),
          address: Yup.string().max(60, "Shipping Address must be at most 60 characters"),
        }),
      }),
      invoiceDetails: Yup.object({
        number: Yup.string().required("Invoice number is required"),
        date: Yup.date().required("Invoice date is required"),
        dueDate: Yup.date().required("Due date is required"),
      }),
      itemHeaders: Yup.array()
        .of(Yup.string().required("Header name is required"))
        .min(1, "At least one header is required"),
      items: Yup.array().of(
        Yup.object().shape({
          data: Yup.lazy((obj) => 
            Yup.object(
              Object.keys(obj || {}).reduce((acc, key) => {
                acc[key] = Yup.string().required(`${key} is required`);
                return acc;
              }, {} as Record<string, Yup.StringSchema>)
            )
          ),
          quantity: Yup.number()
            .min(1, "Quantity must be at least 1")
            .required("Quantity is required"),
          rate: Yup.number()
            .min(0, "Rate must be positive")
            .required("Rate is required"),
        })
      ),
    });
  }, []);

  const formik = useFormik({
    initialValues: getInitialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const errors = await formik.validateForm(values);
        const emptyFieldMessages = getEmptyFields(errors);

        if (Object.keys(errors).length > 0) {
          formik.setTouched({
            senderDetails: { name: true, address: true },
            recipientDetails: { billTo: { name: true, address: true } },
            invoiceDetails: { number: true, date: true, dueDate: true },
            items: formik.values.items.map(() => ({ data: {}, quantity: true, rate: true })),
          }, true);

          emptyFieldMessages.forEach(message => {
            toast.error(message, {
              position: "bottom-right",
              autoClose: 5000,
            });
          });
          return;
        }

        const isEditing = !!initialData;
        const url = isEditing
          ? `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${initialData._id}`
          : `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices`;

        const method = isEditing ? 'put' : 'post';

        const calculatedTotals = {
          ...values.totals,
          subtotal: calculateSubtotal(values.items),
          tax: calculateTax(
            calculateSubtotal(values.items),
            values.totals.taxRate,
            // values.totals.taxType
          ),
          discount: calculateDiscount(
            calculateSubtotal(values.items),
            values.totals.discountType
          ),
          shipping: calculateShipping(
            calculateSubtotal(values.items),
            values.totals.shipping,
            values.totals.shippingType
          ),
        };

        calculatedTotals.total = Number(calculateTotal(
          calculatedTotals.subtotal,
          calculatedTotals.tax,
          calculatedTotals.discount,
          calculatedTotals.shipping
        ));

        calculatedTotals.balanceDue = Number(calculatedTotals.total - calculatedTotals.amountPaid);

        let finalValues = {
          ...values,
          userId: user?.user?._id,
          totals: calculatedTotals,
        };

        if (isEditing) {
          finalValues = {
            ...finalValues,
            invoiceDetails: {
              ...finalValues.invoiceDetails,
              number: initialData.invoiceDetails.number,
              date: initialData.invoiceDetails.date,
            },
          };
        }

        finalValues = cleanMongoFields(finalValues);

        const response = await axios[method](url, finalValues, { withCredentials: true });

        if (response.data) {
          toast.success(isEditing ? 'Invoice updated successfully' : 'Invoice saved successfully', {
            position: "bottom-right",
          });

          if (!isEditing) {
            resetForm();
            await generateInvoiceNumber();
           router.push(`/user/d/${response.data.invoice._id}?openModal=true`); // Redirect to /user/myinvoice when a new invoice is saved
          } else {
            router.push(`/user/d/${response.data._id}?openModal=true`); // Redirect to /user/d/[id] when an invoice is updated
          }
        }

        //   if (!isEditing) {
        //     resetForm();
        //     await generateInvoiceNumber();
        //     router.push(`/user/d/${response.data.invoice._id}`);
        //   } else {
        //     router.push(`/user/d/${response.data._id}`);
        //   }
        // }
      } catch (error) {
        console.error("Operation failed:", error);
        toast.error(
          axios.isAxiosError(error)
            ? error.response?.data?.message || error.message
            : 'Something went wrong. Please try again.', {
            position: "bottom-right",
          }
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (user?.user._id && !initialData) {
      generateInvoiceNumber();
    }
  }, [user, initialData]);

  const generateInvoiceNumber = useCallback(async () => {
    if (!user?.user._id) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/userId/${user.user._id}`
      );
      const invoices = response.data;
      let newInvoiceNumber = "INV-0001";

      if (invoices?.length > 0) {
        const latestInvoice = invoices[invoices.length - 1];
        if (latestInvoice.invoiceDetails?.number) {
          const lastNumber = parseInt(
            latestInvoice.invoiceDetails.number.replace("INV-", ""),
            10
          );
          newInvoiceNumber = `INV-${String(lastNumber + 1).padStart(4, "0")}`;
        }
      }

      formik.setFieldValue("invoiceDetails.number", newInvoiceNumber);
      formik.setFieldValue("senderDetails.name", user.user.firstName || "");
      formik.setFieldValue("senderDetails.address", user.user.address || "");
      formik.setFieldValue("senderDetails.logo", user.user.logo || "");
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, [user?.user._id, formik.setFieldValue]);

  const generatePDF = useCallback(async () => {
    try {
      const invoiceDataWithId = {
        ...formik.values,
        _id: initialData?._id || 'dummy-id',
      };
      const pdfBlob = await generateInvoicePDF(invoiceDataWithId);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${formik.values.invoiceDetails.number || 'draft'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }, [formik.values, initialData]);

  const updateSenderDetails = useCallback((details: typeof initialInvoiceData.senderDetails) => {
    formik.setFieldValue("senderDetails", details);
  }, [formik.setFieldValue]);

  const updateRecipientDetails = useCallback((details: typeof initialInvoiceData.recipientDetails) => {
    formik.setFieldValue("recipientDetails", details);
  }, [formik.setFieldValue]);

  const updateInvoiceDetails = useCallback((details: typeof initialInvoiceData.invoiceDetails) => {
    formik.setFieldValue("invoiceDetails", details);
  }, [formik.setFieldValue]);

  const updateItemHeaders = useCallback((headers: string[]) => {
    formik.setFieldValue("itemHeaders", headers);
    
    // Update all items to include the new headers
    const updatedItems = formik.values.items.map(item => ({
      ...item,
      data: headers.reduce((acc: Record<string, string>, header) => {
        acc[header] = item.data[header] || "";
        return acc;
      }, {})
    }));
    
    formik.setFieldValue("items", updatedItems);
  }, [formik.setFieldValue, formik.values.items]);

  const updateItems = useCallback((items: typeof initialInvoiceData.items) => {
    formik.setFieldValue("items", items);
  
    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(subtotal, formik.values.totals.taxRate);
    const discount = calculateDiscount(
      subtotal,
      formik.values.totals.discountType
    );
    const shipping = calculateShipping(
      subtotal,
      formik.values.totals.shipping,
      formik.values.totals.shippingType
    );
    const total = calculateTotal(subtotal, tax, discount, shipping);
    const balanceDue = total - formik.values.totals.amountPaid;
  
    formik.setFieldValue("totals", {
      ...formik.values.totals,
      subtotal,
      tax,
      discount,
      total,
      balanceDue,
    });
  }, [formik.setFieldValue, formik.values.totals]);

  const updateTotals = useCallback((totals: typeof initialInvoiceData.totals) => {
    const subtotal = calculateSubtotal(formik.values.items);
    const tax = calculateTax(subtotal, totals.taxRate);
    const discount = calculateDiscount(subtotal, totals.discountType);
    const shipping = calculateShipping(subtotal, totals.shipping, totals.shippingType);
    const total = calculateTotal(subtotal, tax, discount, shipping);
    const balanceDue = total - totals.amountPaid;

    formik.setFieldValue("totals", {
      ...totals,
      subtotal,
      tax,
      discount,
      total,
      balanceDue,
    });
  }, [formik.setFieldValue, formik.values.items]);

  const updateNotes = useCallback((notes: string) => {
    formik.setFieldValue("notes", notes);
  }, [formik.setFieldValue]);

  const updateTerms = useCallback((terms: string) => {
    formik.setFieldValue("terms", terms);
  }, [formik.setFieldValue]);

  const saveInvoice = async () => {
    const errors = await formik.validateForm();
    const emptyFieldMessages = getEmptyFields(errors);

    formik.setTouched({
      senderDetails: { name: true, address: true },
      recipientDetails: { billTo: { name: true, address: true } },
      invoiceDetails: { number: true, date: true, dueDate: true },
      items: formik.values.items.map(() => ({ data: {}, quantity: true, rate: true })),
    }, true);

    emptyFieldMessages.forEach(message => {
      toast.error(message, {
        position: "bottom-right",
        autoClose: 5000,
      });
    });

    formik.handleSubmit();
  };

  return {
    invoiceData: formik.values,
    updateSenderDetails,
    updateRecipientDetails,
    updateInvoiceDetails,
    updateItemHeaders,
    updateItems,
    updateTotals,
    updateNotes,
    updateTerms,
    generatePDF,
    saveInvoice,
    formErrors: formik.errors,
    formTouched: formik.touched,
    formik,
  };
}