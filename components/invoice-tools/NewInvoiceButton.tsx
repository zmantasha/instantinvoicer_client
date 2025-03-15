"use client";

import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";

export default function NewInvoiceButton() {
  const router = useRouter();

  const handleNewInvoice = () => {
    router.push("/user/invoicetamplate");
  };

  return (
    <Button
    variant="outline"
    className="text-white bg-[#0c69cc] hover:bg-[#0f7fe6] hover:text-white"
    onClick={handleNewInvoice}
  >
    New Invoice
  </Button>
  );
}
