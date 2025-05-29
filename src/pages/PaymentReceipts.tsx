
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

// Mock data for payment receipts
const mockPaymentReceipts = [
  {
    id: 1,
    receipt_code: "PT001",
    type: "thu",
    amount: 2000000,
    description: "Thu tiền bán hàng",
    payment_method: "Chuyển khoản",
    reference_number: "DH001",
    created_date: "2024-05-20T14:30:00Z",
    created_by: "Admin",
  },
  {
    id: 2,
    receipt_code: "PC001",
    type: "chi",
    amount: 1500000,
    description: "Chi phí nhập hàng",
    payment_method: "Tiền mặt",
    reference_number: "NK001",
    created_date: "2024-05-21T09:15:00Z",
    created_by: "Kế toán A",
  },
];

const PaymentReceipts = () => {
  const columns: ColumnDef<any, any>[] = [
    {
      header: "Mã phiếu",
      accessorKey: "receipt_code",
      cell: ({ row }) => (
        <span className="font-medium text-primary">{row.original.receipt_code}</span>
      ),
    },
    {
      header: "Loại",
      accessorKey: "type",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.original.type === 'thu' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.type === 'thu' ? 'Phiếu thu' : 'Phiếu chi'}
        </span>
      ),
    },
    {
      header: "Số tiền",
      accessorKey: "amount",
      cell: ({ row }) => (
        <span className={row.original.type === 'thu' ? 'text-green-600' : 'text-red-600'}>
          {row.original.type === 'thu' ? '+' : '-'}{formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      header: "Nội dung",
      accessorKey: "description",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
    {
      header: "Phương thức",
      accessorKey: "payment_method",
    },
    {
      header: "Tham chiếu",
      accessorKey: "reference_number",
    },
    {
      header: "Ngày tạo",
      accessorKey: "created_date",
      cell: ({ row }) => formatDate(row.original.created_date),
    },
    {
      header: "Người tạo",
      accessorKey: "created_by",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Phiếu thu chi</h1>
      </div>

      <DataTable
        columns={columns}
        data={mockPaymentReceipts}
        searchPlaceholder="Tìm kiếm phiếu thu chi..."
        isPending={false}
      />
    </div>
  );
};

export default PaymentReceipts;
