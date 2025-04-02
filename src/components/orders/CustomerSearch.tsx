
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/services/customerService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X, User } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CustomerSearchProps {
  onSelectCustomer: (customer: any) => void;
  selectedCustomer?: any;
}

export function CustomerSearch({ onSelectCustomer, selectedCustomer }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const { data: customers, isPending } = useQuery({
    queryKey: ["customers-search", searchTerm],
    queryFn: () => getCustomers({ search: searchTerm, per_page: 5 }),
    enabled: searchTerm.length > 2 && open,
  });

  // Close popover when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      setOpen(false);
    }
  }, [selectedCustomer]);

  // Clear selected customer
  const handleClear = () => {
    onSelectCustomer(null);
  };

  return (
    <div className="space-y-2">
      <Label>Khách hàng</Label>
      
      {selectedCustomer ? (
        <div className="flex items-center justify-between p-2 border rounded-md">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{selectedCustomer.first_name?.[0]}{selectedCustomer.last_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {selectedCustomer.first_name} {selectedCustomer.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedCustomer.email}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm kiếm khách hàng..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="start">
            <div className="p-2">
              {isPending ? (
                <div className="flex items-center justify-center p-4">
                  <div className="loading-spinner mr-2" />
                  <span>Đang tìm kiếm...</span>
                </div>
              ) : !customers || customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <User className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm.length > 2 
                      ? "Không tìm thấy khách hàng nào" 
                      : "Nhập ít nhất 3 ký tự để tìm kiếm"}
                  </p>
                </div>
              ) : (
                <div className="max-h-72 overflow-auto">
                  {customers.map((customer) => (
                    <div 
                      key={customer.id}
                      className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer rounded-md"
                      onClick={() => onSelectCustomer(customer)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{customer.first_name?.[0]}{customer.last_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {customer.first_name} {customer.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
