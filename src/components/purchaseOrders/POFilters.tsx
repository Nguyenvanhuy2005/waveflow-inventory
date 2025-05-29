
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface POFiltersProps {
  onFiltersChange: (filters: {
    status?: string;
    supplier_id?: number;
    start_date?: string;
    end_date?: string;
    search?: string;
  }) => void;
}

const statusOptions = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'received', label: 'Đã nhận hàng' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const mockSuppliers = [
  { id: 1, name: "Công ty TNHH ABC" },
  { id: 2, name: "Nhà cung cấp XYZ" },
];

export function POFilters({ onFiltersChange }: POFiltersProps) {
  const [filters, setFilters] = useState<{
    status?: string;
    supplier_id?: number;
    start_date?: string;
    end_date?: string;
    search?: string;
  }>({});

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="font-medium">Bộ lọc</span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <Input
            placeholder="Tìm kiếm mã PO..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        <div>
          <Select value={filters.status || ''} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={filters.supplier_id ? String(filters.supplier_id) : ''} onValueChange={(value) => updateFilter('supplier_id', value ? parseInt(value) : undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="Nhà cung cấp" />
            </SelectTrigger>
            <SelectContent>
              {mockSuppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={String(supplier.id)}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Input
            type="date"
            placeholder="Từ ngày"
            value={filters.start_date || ''}
            onChange={(e) => updateFilter('start_date', e.target.value)}
          />
        </div>

        <div>
          <Input
            type="date"
            placeholder="Đến ngày"
            value={filters.end_date || ''}
            onChange={(e) => updateFilter('end_date', e.target.value)}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="secondary">
              Trạng thái: {statusOptions.find(s => s.value === filters.status)?.label}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter('status', '')} />
            </Badge>
          )}
          {filters.supplier_id && (
            <Badge variant="secondary">
              NCC: {mockSuppliers.find(s => s.id === filters.supplier_id)?.name}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter('supplier_id', undefined)} />
            </Badge>
          )}
          {filters.start_date && (
            <Badge variant="secondary">
              Từ: {filters.start_date}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter('start_date', '')} />
            </Badge>
          )}
          {filters.end_date && (
            <Badge variant="secondary">
              Đến: {filters.end_date}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilter('end_date', '')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
