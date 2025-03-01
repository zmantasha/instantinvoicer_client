// export default function FilterComponent(){

// }

// Add these imports at the top
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { format } from "date-fns";

// Add these state variables
export default function FilterComponent(){
const [selectedFilter, setSelectedFilter] = useState("all");
const [searchQuery, setSearchQuery] = useState("");
const [openDatePicker, setOpenDatePicker] = useState(false);
const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
const [selectedStatus, setSelectedStatus] = useState("");
const [selectedCurrency, setSelectedCurrency] = useState("");
const [amountRange, setAmountRange] = useState({ min: "", max: "" });

// Add the filter component JSX before the view header
return (
<div className="w-full mb-8">
  {/* Filter Header */}
  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4 p-4 bg-white rounded-lg shadow-sm">
    {/* Filter Type Dropdown */}
    <div className="w-full sm:w-64">
      <Select onValueChange={(value) => setSelectedFilter(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filter by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="status">Status</SelectItem>
          <SelectItem value="dueDate">Due Date</SelectItem>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="currency">Currency</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Search Input */}
    <div className="w-full sm:flex-1">
      <Input
        placeholder={`Search by ${selectedFilter}...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
    </div>

    {/* Advanced Filter Button */}
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Advanced Filters
        </Button>
      </PopoverTrigger>
      
      {/* Advanced Filter Content */}
      <PopoverContent className="w-80 p-6 bg-white rounded-xl shadow-lg">
        <div className="grid gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.start ? (
                    dateRange.end ? (
                      <>
                        {format(dateRange.start, "LLL dd, y")} -{" "}
                        {format(dateRange.end, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.start, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange.start ? { from: dateRange.start, to: dateRange.end } : undefined}
                onSelect={(range) =>
                setDateRange({
                    start: range?.from ? new Date(range.from) : undefined,
                    end: range?.to ? new Date(range.to) : undefined,
                })
                }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick Date Presets */}
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30].map((days) => (
              <Button
                key={days}
                variant="outline"
                size="sm"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - days);
                  setDateRange({ start, end });
                }}
              >
                Last {days} days
              </Button>
            ))}
          </div>

          {/* Currency Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            {/* <Input
              placeholder="USD, EUR, etc."
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            /> */}
            <Select onValueChange={setSelectedCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amountRange.min}
                onChange={(e) => setAmountRange(prev => ({
                  ...prev,
                  min: e.target.value
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
              <Input
                type="number"
                placeholder="1000.00"
                value={amountRange.max}
                onChange={(e) => setAmountRange(prev => ({
                  ...prev,
                  max: e.target.value
                }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDateRange({});
                setSelectedStatus("");
                setSelectedCurrency("");
                setAmountRange({ min: "", max: "" });
              }}
            >
              Clear All
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>

  {/* Active Filters Display */}
  <div className="flex flex-wrap gap-2 px-4">
    {selectedStatus && (
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
        Status: {selectedStatus}
        <button onClick={() => setSelectedStatus("")} className="text-blue-500 hover:text-blue-700">
          ×
        </button>
      </span>
    )}
    
    {dateRange.start && (
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
        Date: {format(dateRange.start, "MMM dd")} - {format(dateRange.end || dateRange.start, "MMM dd")}
        <button onClick={() => setDateRange({})} className="text-green-500 hover:text-green-700">
          ×
        </button>
      </span>
    )}
    
    {selectedCurrency && (
      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
        Currency: {selectedCurrency}
        <button onClick={() => setSelectedCurrency("")} className="text-purple-500 hover:text-purple-700">
          ×
        </button>
      </span>
    )}
    
    {(amountRange.min || amountRange.max) && (
      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-2">
        Amount: {amountRange.min || '0'} - {amountRange.max || '∞'}
        <button onClick={() => setAmountRange({ min: "", max: "" })} className="text-orange-500 hover:text-orange-700">
          ×
        </button>
      </span>
    )}
  </div>
</div>
)}