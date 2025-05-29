
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

// Mock data for suppliers
const mockSuppliers = [
  {
    id: 1,
    name: "Công ty TNHH ABC",
    contact_person: "Nguyễn Văn A",
    email: "contact@abc.com",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    status: "active",
    created_date: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Nhà cung cấp XYZ",
    contact_person: "Trần Thị B",
    email: "info@xyz.com",
    phone: "0987654321",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    status: "active",
    created_date: "2024-02-01T14:20:00Z",
  },
];

const Suppliers = () => {
  const columns: ColumnDef<any, any>[] = [
    {
      header: "ID",
      accessorKey: "id",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.id}</span>
      ),
    },
    {
      header: "Tên nhà cung cấp",
      accessorKey: "name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      header: "Người liên hệ",
      accessorKey: "contact_person",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Số điện thoại",
      accessorKey: "phone",
    },
    {
      header: "Địa chỉ",
      accessorKey: "address",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.address}>
          {row.original.address}
        </div>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} type="general" />,
    },
    {
      header: "Ngày tạo",
      accessorKey: "created_date",
      cell: ({ row }) => formatDate(row.original.created_date),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nhà cung cấp</h1>
      </div>

      <DataTable
        columns={columns}
        data={mockSuppliers}
        searchPlaceholder="Tìm kiếm nhà cung cấp..."
        isPending={false}
      />
    </div>
  );
};

export default Suppliers;
