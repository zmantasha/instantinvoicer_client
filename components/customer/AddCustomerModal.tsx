import { useParams, usePathname } from "next/navigation";
import { Modal } from "../ui/modal";
import AddCustomer from "./AddCustomer";

interface props{
    modalOpen:boolean;
    setModalOpen:(value:boolean)=>void;
}


export default function AddCustomerModal({modalOpen,setModalOpen}:props){
   const pathname = usePathname();
   const customerInvoicePath=pathname.split("/")[2]
   console.log(pathname.split("/")[2])
    const handleCloseModal=()=>{
        setModalOpen(false)
    }
    return (
        <>
        <Modal open={modalOpen} onClose={handleCloseModal} wide={true}>
        <AddCustomer customerInvoicePath={customerInvoicePath} setModalOpen={setModalOpen}/>
        </Modal>
        </>
    )
}