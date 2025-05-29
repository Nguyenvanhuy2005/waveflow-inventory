
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

// Mock data for returns
const mockReturns = [
  {
    id: 1,
    return_code: "TH001",
    order_number: "DH001",
    customer_name: "Nguyễn Văn A",
    total_amount: 500000,
    reason: "Sản phẩm lỗi",
    status: "approved",
    return_date: "2024-05-22T10:15:00Z",
    processed_by: "Nhân viên B",
  },
  {
    id: 2,
    return_code: "TH002",
    order_number: "DH005",
    customer_name: "Trần Thị C",
    total_amount: 300000,
    reason: "Không đúng yêu cầu",
    status: "pending",
    return_date: "2024-05-26T16:45:00Z",
    processed_by: null,
  },
];

const Returns = () => {
  const columns: ColumnDef<any, any>[] = [
    {
      header: "Mã trả hàng",
      accessorKey: "return_code",
      cell: ({ row }) => (
        <span className="font-medium text-primary">{row.original.return_code}</span>
      ),
    },
    {
      header: "Đơn hàng",
      accessorKey: "order_number",
      cell: ({ row }) => (
        <span className="font-medium">#{row.original.order_number}</span>
      ),
    },
    {
      header: "Khách hàng",
      accessorKey: "customer_name",
    },
    {
      header: "Số tiền",
      accessorKey: "total_amount",
      cell: ({ row }) => formatCurrency(row.original.total_amount),
    },
    {
      header: "Lý do trả hàng",
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
      header: "Ngày trả",
      accessorKey: "return_date",
      cell: ({ row }) => formatDate(row.original.return_date),
    },
    {
      header: "Người xử lý",
      accessorKey: "processed_by",
      cell: ({ row }) => row.original.processed_by || "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trả hàng</h1>
      </div>

      <DataTable
        columns={columns}
        data={mockReturns}
        searchPlaceholder="Tìm kiếm phiếu trả hàng..."
        isPending={false}
      />
    </div>
  );
};

export default Returns;
