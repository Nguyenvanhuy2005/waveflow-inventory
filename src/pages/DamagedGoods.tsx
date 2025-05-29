
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

// Mock data for damaged goods
const mockDamagedGoods = [
  {
    id: 1,
    damage_code: "HH001",
    product_name: "Laptop Dell Inspiron 15",
    sku: "DELL-INS-15-001",
    quantity: 2,
    unit_price: 15000000,
    total_value: 30000000,
    reason: "Vận chuyển làm hỏng màn hình",
    status: "reported",
    damage_date: "2024-05-23T11:20:00Z",
    reported_by: "Nhân viên kho",
  },
  {
    id: 2,
    damage_code: "HH002",
    product_name: "Điện thoại iPhone 15",
    sku: "IPHONE-15-128GB",
    quantity: 1,
    unit_price: 25000000,
    total_value: 25000000,
    reason: "Lỗi từ nhà sản xuất",
    status: "processed",
    damage_date: "2024-05-25T15:45:00Z",
    reported_by: "Nhân viên bán hàng",
  },
];

const DamagedGoods = () => {
  const columns: ColumnDef<any, any>[] = [
    {
      header: "Mã hàng hỏng",
      accessorKey: "damage_code",
      cell: ({ row }) => (
        <span className="font-medium text-primary">{row.original.damage_code}</span>
      ),
    },
    {
      header: "Sản phẩm",
      accessorKey: "product_name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.product_name}</div>
          <div className="text-sm text-muted-foreground">{row.original.sku}</div>
        </div>
      ),
    },
    {
      header: "Số lượng",
      accessorKey: "quantity",
    },
    {
      header: "Đơn giá",
      accessorKey: "unit_price",
      cell: ({ row }) => formatCurrency(row.original.unit_price),
    },
    {
      header: "Tổng giá trị",
      accessorKey: "total_value",
      cell: ({ row }) => (
        <span className="font-medium text-red-600">
          {formatCurrency(row.original.total_value)}
        </span>
      ),
    },
    {
      header: "Lý do hỏng",
      accessorKey: "reason",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.reason}>
          {row.original.reason}
        </div>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} type="general" />,
    },
    {
      header: "Ngày báo cáo",
      accessorKey: "damage_date",
      cell: ({ row }) => formatDate(row.original.damage_date),
    },
    {
      header: "Người báo cáo",
      accessorKey: "reported_by",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hàng hỏng</h1>
      </div>

      <DataTable
        columns={columns}
        data={mockDamagedGoods}
        searchPlaceholder="Tìm kiếm hàng hỏng..."
        isPending={false}
      />
    </div>
  );
};

export default DamagedGoods;
