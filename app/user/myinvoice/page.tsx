// app/user/myinvoice/page.tsx
import { cookies } from "next/headers";
import styles from "./myinvoice.module.css";
import NewInvoiceButton from "@/components/invoice-tools/NewInvoiceButton";
import InvoiceLoader from "@/components/invoice-tools/InvoiceLoader";
import { revalidateTag } from "next/cache";

async function fetchUser() {
  const accessToken = cookies().get("accessToken")?.value;
  if (!accessToken) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/user/me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

async function fetchAllInvoices(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/userId/${userId}`,
      { 
        next: { tags: ['invoices'] }, // Add cache tag
        cache: "no-store"
      }
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

export default async function MyInvoice() {
  const user = await fetchUser();
  // console.log(user.user._id);
  const invoices = user ? await fetchAllInvoices(user?.user._id) : [];
  //  console.log(invoices);
  return (
    <div className={styles.myInvoicePage}>
      <div className={styles.myInvoiceContainer}>
        <div className={styles.invoiceCard}>
          <div className={styles.invoiceHeader}>
            <h2 className={styles.invoiceTitle}>My Invoices</h2>
            <NewInvoiceButton />
          </div>
          <div className={styles.invoiceContainer}>
            <InvoiceLoader initialInvoices={invoices} />
          </div>
        </div>
      </div>
    </div>
  );
}