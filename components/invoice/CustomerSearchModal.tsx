import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface CustomerSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCustomer: (customer: any) => void;
    onAddNewCustomer: () => void;
    search: string;
    setSearch: (value: string) => void;
    customers: any[];
    loading: boolean;
  }
  
  export default function CustomerSearchModal({
    isOpen,
    onClose,
    onSelectCustomer,
    onAddNewCustomer,
    search,
    setSearch,
    customers,
    loading,
  }: CustomerSearchModalProps)  {
    if (!isOpen) return null;
  console.log(customers)
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Customer</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
  
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="mb-4"
          />
  
          {loading && <div className="text-center p-4">Searching...</div>}
  
          <div className="max-h-60 overflow-y-auto mb-4">
            {customers.map((customer) => (
              <div
                key={customer._id}
                className="p-3 hover:bg-gray-100 cursor-pointer rounded-md"
                onClick={() => onSelectCustomer(customer)}
              >
                <div className="font-medium">{customer.displayName}</div>
                <div className="text-sm text-gray-500">
                  {customer.billingAddress?.street1}
                </div>
              </div>
            ))}
          </div>
  
          <Button
            className="w-full"
            variant="outline"
            onClick={onAddNewCustomer}
          >
            Add New Customer
          </Button>
        </div>
      </div>
    );
  };