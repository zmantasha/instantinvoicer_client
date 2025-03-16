import styles from "../../app/user/customer/customer.module.css" 
interface customers{
    _id:number;
    name:string;
    email:string;
    phone:string;
    status:string;
}

interface customersTableProps{
    customers:customers[];
}

export default function CustomerTable({customers}:customersTableProps){
    const headers = ["Name", "Email", "Phone",  "Status",];
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
                <td className="p-3">{customer.name}</td>
                <td className="p-3">{customer.email}</td>
                <td className="p-3">{customer.phone}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-sm rounded-full ${customer.status === "Active" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"}`}>
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