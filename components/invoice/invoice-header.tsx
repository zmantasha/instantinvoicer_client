import { ImagePlus, X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { FormError } from "../../components/ui/form-error";
import React, { memo } from 'react';
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "react-toastify";
interface InvoiceHeaderProps {
  senderDetails: {
    logo: string;
    name: string;
    address: string;
  };
  recipientDetails: {
    billTo: {
      name: string;
      address: string;
    };
    shipTo: {
      name: string;
      address: string;
    };
  };
  invoiceDetails: {
    number: string;
    date: string;
    dueDate: string;
    paymentTerms: string;
    poNumber: string;
  };
  onUpdateSender: (details: any) => void;
  onUpdateRecipient: (details: any) => void;
  onUpdateInvoice: (details: any) => void;
  formErrors: any;
  formTouched: any;
  formik: any;
}

const InvoiceHeader= memo(({
  senderDetails,
  recipientDetails,
  invoiceDetails,
  onUpdateSender,
  onUpdateRecipient,
  onUpdateInvoice,
  formErrors,
  formTouched,
  formik
}: InvoiceHeaderProps) =>{
  // const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       onUpdateSender({ ...senderDetails, logo: reader.result });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const accessToken = Cookies.get("accessToken");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/upload-logo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true, // Ensures cookies are sent with the request
        }
      );

      const { data } = response;
      toast.success("Logo uploaded successfully!", {
        position: "bottom-right",
      });

      onUpdateSender({ ...senderDetails, logo: data.logoUrl });
    } catch (error) {
      console.error("Error uploading logo:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`Upload failed: ${error.response.data.message || "Server error"}`, {
          position: "bottom-right",
        });
      } else {
        toast.error("Unexpected error occurred while uploading.", {
          position: "bottom-right",
        });
      }
    }
  }
};

  

  const removeLogo = () => {
    onUpdateSender({ ...senderDetails, logo: "" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {/* Left Column - Logo and Sender */}
      <div className="space-y-6">
        <div className="relative w-48 h-32 mx-auto md:mx-0 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          {senderDetails.logo ? (
            <div className="relative w-full h-full">
              <img
                src={senderDetails.logo}
                alt="Company Logo"
                className="w-full h-full object-contain p-2"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white"
                onClick={removeLogo}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center"
              onClick={() => document.getElementById("logo-upload")?.click()}
            >
              <ImagePlus className="h-8 w-8 mb-2 text-gray-400" />
              <span className="text-sm text-gray-500">Add Your Logo</span>
            </Button>
          )}
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sender-name">Who is this from?</Label>
            <Input
              id="sender-name"
              value={formik.values.senderDetails.name}
              onChange={(e) =>
                onUpdateSender({
                  ...senderDetails,
                  name: e.target.value,
                })
              }
              placeholder="Your business name"
            />
            <FormError
              message={formErrors.senderDetails?.name}
              className={formTouched.senderDetails?.name ? "block" : "hidden"}
            />
          </div>
          <div>
            <Label htmlFor="sender-address">Address</Label>
            <Textarea
              id="sender-address"
              value={formik.values.senderDetails.address}
              onChange={(e) =>
                onUpdateSender({ ...senderDetails, address: e.target.value })
              }
              placeholder="Your business address"
              rows={3}
            />
            <FormError 
              message={formErrors.senderDetails?.address}
              className={formTouched.senderDetails?.address ? "block" : "hidden"}
            />
          </div>
        </div>
      </div>

      {/* Middle Column - Bill To & Ship To */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Bill To</Label>
            <Input
              value={formik.values.recipientDetails.billTo.name}
              onChange={(e) =>
                onUpdateRecipient({
                  ...recipientDetails,
                  billTo: { ...recipientDetails.billTo, name: e.target.value },
                })
              }
              placeholder="Who is this to?"
            />
            <FormError 
              message={formErrors.recipientDetails?.billTo?.name}
              className={formTouched.recipientDetails?.billTo?.name ? "block" : "hidden"}
            />
            <Textarea
              value={formik.values.recipientDetails.billTo.address}
              onChange={(e) =>
                onUpdateRecipient({
                  ...recipientDetails,
                  billTo: { ...recipientDetails.billTo, address: e.target.value },
                })
              }
              placeholder="Billing address"
              className="mt-2"
              rows={3}
            />
            <FormError 
              message={formErrors.recipientDetails?.billTo?.address}
              className={formTouched.recipientDetails?.billTo?.address ? "block" : "hidden"}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Ship To (optional)</Label>
            <Input
              value={formik.values.recipientDetails.shipTo.name}
              onChange={(e) =>
                onUpdateRecipient({
                  ...recipientDetails,
                  shipTo: { ...recipientDetails.shipTo, name: e.target.value },
                })
              }
              placeholder="Shipping recipient"
            />
            <Textarea
              value={formik.values.recipientDetails.shipTo.address}
              onChange={(e) =>
                onUpdateRecipient({
                  ...recipientDetails,
                  shipTo: { ...recipientDetails.shipTo, address: e.target.value },
                })
              }
              placeholder="Shipping address (optional)"
              className="mt-2"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Right Column - Invoice Details */}
      <Card className="p-4 md:p-6">
        <div className="text-2xl font-bold text-center mb-6">INVOICE</div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label>#</Label>
            <Input
              value={formik.values.invoiceDetails.number}
              onChange={(e) =>
                onUpdateInvoice({ ...invoiceDetails, number: e.target.value })
              }
              className="text-right"
              readOnly={!!formik.initialValues._id} // Make read-only if editing
            />
            <FormError 
              message={formErrors?.invoiceDetails?.number}
              className={formTouched.invoiceDetails?.number ? "block" : "hidden"}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label>Date</Label>
            <Input
              type="date"
              value={formik.values.invoiceDetails.date}
              onChange={(e) =>
                onUpdateInvoice({ ...invoiceDetails, date: e.target.value })
              }
              readOnly={!!formik.initialValues._id} // Make read-only if editing
            />
            <FormError 
              message={formErrors?.invoiceDetails?.date}
              className={formTouched.invoiceDetails?.date ? "block" : "hidden"}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label>Payment Terms</Label>
            <Input
              value={formik.values.invoiceDetails.paymentTerms}
              onChange={(e) =>
                onUpdateInvoice({ ...invoiceDetails, paymentTerms: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={formik.values.invoiceDetails.dueDate}
              onChange={(e) =>
                onUpdateInvoice({ ...invoiceDetails, dueDate: e.target.value })
              }
              readOnly={!!formik.initialValues._id} // Make read-only if editing
            />
            <FormError 
              message={formErrors?.invoiceDetails?.dueDate}
              className={formTouched.invoiceDetails?.dueDate ? "block" : "hidden"}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label>PO Number</Label>
            <Input
              value={formik.values.invoiceDetails.poNumber}
              onChange={(e) =>
                onUpdateInvoice({ ...invoiceDetails, poNumber: e.target.value })
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
})

InvoiceHeader.displayName = 'InvoiceHeader';
export { InvoiceHeader };
