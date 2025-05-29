
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

// Mock data for inventory imports
const mockInventoryImports = [
  {
    id: 1,
    import_code: "NK001",
    supplier_name: "Công ty TNHH ABC",
    total_amount: 15000000,
    total_items: 50,
    status: "completed",
    import_date: "2024-05-20T09:00:00Z",
    created_by: "Admin",
  },
  {
    id: 2,
    import_code: "NK002",
    supplier_name: "Nhà cung cấp XYZ",
    total_amount: 8500000,
    total_items: 30,
    status: "pending",
    import_date: "2024-05-25T14:30:00Z",
    created_by: "Nhân viên A",
  },
];

const InventoryImport = () => {
  const columns: ColumnDef<any, any>[] = [
    {
      header: "Mã phiếu nhập",
      accessorKey: "import_code",
      cell: ({ row }) => (
        <span className="font-medium text-primary">{row.original.import_code}</span>
      ),
    },
    {
      header: "Nhà cung cấp",
      accessorKey: "supplier_name",
    },
    {
      header: "Tổng tiền",
      accessorKey: "total_amount",
      cell: ({ row }) => formatCurrency(row.original.total_amount),
    },
    {
      header: "Số lượng mặt hàng",
      accessorKey: "total_items",
      cell: ({ row }) => (
        <span>{row.original.total_items} sản phẩm</span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} type="general" />,
    },
    {
      header: "Ngày nhập",
      accessorKey: "import_date",
      cell: ({ row }) => formatDate(row.original.import_date),
    },
    {
      header: "Người tạo",
      accessorKey: "created_by",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nhập hàng</h1>
      </div>

      <DataTable
        columns={columns}
        data={mockInventoryImports}
        searchPlaceholder="Tìm kiếm phiếu nhập..."
        isPending={false}
      />
    </div>
  );
};

export default InventoryImport;
