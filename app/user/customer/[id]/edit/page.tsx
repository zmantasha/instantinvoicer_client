"use client"
import AddCustomer from "@/components/customer/AddCustomer";
import { useParams } from "next/navigation";

export default function EditCustomer(){
    const {id}= useParams()
    return (
        <>
        <AddCustomer paramsId={id}/>
        </>
    )
}