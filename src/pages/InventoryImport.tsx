
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Download, Upload } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { getPurchaseOrders, createPurchaseOrder } from "@/services/purchaseOrderService";
import { CreatePOForm } from "@/components/purchaseOrders/CreatePOForm";
import { POFilters } from "@/components/purchaseOrders/POFilters";
import { PurchaseOrder, CreatePurchaseOrderData } from "@/types/purchaseOrder";

const InventoryImport = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchaseOrders = [], isPending } = useQuery({
    queryKey: ["purchase-orders", filters],
    queryFn: () => getPurchaseOrders(filters),
  });

  const createPOMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setShowCreateForm(false);
      toast({
        title: "Thành công",
        description: "Đã tạo đơn đặt hàng mới",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể tạo đơn đặt hàng",
        variant: "destructive",
      });
    },
  });

  const handleCreatePO = (data: CreatePurchaseOrderData) => {
    createPOMutation.mutate(data);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Bản nháp';
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'received': return 'Đã nhận hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const columns: ColumnDef<PurchaseOrder, any>[] = [
    {
      header: "Mã PO",
      accessorKey: "po_number",
      cell: ({ row }) => (
        <span className="font-medium text-primary">{row.original.po_number}</span>
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
      header: "Số mặt hàng",
      accessorKey: "items",
      cell: ({ row }) => (
        <span>{row.original.items.length} sản phẩm</span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        let statusType: 'active' | 'pending' | 'completed' | 'rejected' = 'pending';
        
        switch (status) {
          case 'approved':
          case 'received':
            statusType = 'completed';
            break;
          case 'cancelled':
            statusType = 'rejected';
            break;
          case 'draft':
            statusType = 'active';
            break;
          default:
            statusType = 'pending';
        }
        
        return <StatusBadge status={statusType} type="general" />;
      },
    },
    {
      header: "Ngày đặt",
      accessorKey: "order_date",
      cell: ({ row }) => formatDate(row.original.order_date),
    },
    {
      header: "Ngày giao dự kiến",
      accessorKey: "expected_delivery_date",
      cell: ({ row }) => row.original.expected_delivery_date ? formatDate(row.original.expected_delivery_date) : "-",
    },
    {
      header: "Người tạo",
      accessorKey: "created_by",
    },
    {
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            Chi tiết
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nhập hàng</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Nhập Excel
          </Button>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo đơn đặt hàng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo đơn đặt hàng mới</DialogTitle>
              </DialogHeader>
              <CreatePOForm
                onSubmit={handleCreatePO}
                onCancel={() => setShowCreateForm(false)}
                isSubmitting={createPOMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <POFilters onFiltersChange={setFilters} />

      <DataTable
        columns={columns}
        data={purchaseOrders}
        searchPlaceholder="Tìm kiếm đơn đặt hàng..."
        isPending={isPending}
      />
    </div>
  );
};

export default InventoryImport;
