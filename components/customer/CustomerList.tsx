"use client";
import { useCallback, useEffect, useState } from "react";
import styles from "../../app/user/customer/[id]/customerDetails.module.css";
import Spinner from "../Spinner";
import { Button } from "../ui/button";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useUser } from "@/hooks/UserContext";
import axios from "axios";
interface customers {
  _id: string;
  firstName: string;
}

interface customersTableProps {
  customers: customers[];
  activeCustomerId?: string;
}
export default function CustomerList() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const router = useRouter();
  const {id}=useParams()
  const pathname = usePathname();
  const handleNavigate = (type: string) => {
    router.push(`/user/customer/${type}`);
  };

  // Fetch customer list ONLY on first load
  const fetchCustomers = useCallback(async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/customer/userId/${user?._id}`
      );
      setIsLoading(false);
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  }, [user?._id, setCustomers]);

  // Fetch customer list ONLY when the page loads
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  if (isLoading) {
    return <Spinner loading={isLoading} color="gray" />;
  }
  return (
    <>
      <div className={styles.listHeader}>
        <div className={styles.listFilter}>All Customer List</div>
        <Button
          variant="outline"
          className="text-white bg-[#0c69cc] hover:bg-[#0f7fe6] hover:text-white px-2 py-0"
          onClick={() => handleNavigate("add")}
        >
          <Plus />
        </Button>
      </div>
      <div className={styles.columnContent}>
        <ul>
          {customers.map((customer, index) => (
            <li
              key={customer._id}
              className={`${styles.listItem} ${
                customer._id === id ? styles.active : ""
              }`}
              onClick={() => router.push(`/user/customer/${customer._id}`)}
            >
              {customer.firstName}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
