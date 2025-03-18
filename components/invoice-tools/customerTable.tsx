import Link from "next/link";
import styles from "../../app/user/customer/customer.module.css" 
import { useRouter } from "next/navigation";
interface customers{
    _id:number;
    firstName:string;
    companyName:string;
    email:string;
    workPhone:string;
    customerType:string;
    status:string;
}

interface customersTableProps{
    customers:customers[];
}


export default function CustomerTable({customers}:customersTableProps){
    const headers = ["Name","Company Name", "Email", "Work Phone", "Customer Type", "Status",];
    const router = useRouter();

  const handleRowClick = (id:any) => {
    router.push(`/user/customer/${id}`);
  };
    return(
    <>
    <div className={styles.tableContainer}>
    <table className={styles.customerTable}>
        <thead>
          <tr>
            {headers.map((item, i) => (
              <th key={i}>{item}</th>
            ))}
          </tr>
        </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
               <td className="p-3" onClick={() => handleRowClick(customer._id)}>{customer.firstName}</td>
                <td className="p-3">{customer.companyName}</td>
                <td className="p-3">{customer.email}</td>
                <td className="p-3">{customer?.workPhone}</td>
                <td className="p-3">{customer?.customerType}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-sm rounded-full ${customer.status === "active" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"}`}>
                    {customer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
    )
}