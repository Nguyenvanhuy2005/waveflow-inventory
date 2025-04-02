import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getProducts, ProductSearchParams } from "@/services/productService";
import { DataTable } from "@/components/DataTable";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

const Products = () => {
  const [searchParams, setSearchParams] = useState<ProductSearchParams>({
    per_page: 10,
    page: 1,
  });

  const { data, isPending } = useQuery({
    queryKey: ["products", searchParams],
    queryFn: () => getProducts(searchParams),
  });

  const handleSearch = (query: string) => {
    setSearchParams((prev) => ({ ...prev, search: query, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page: page + 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sản phẩm</h1>
      </div>

      <DataTable
        columns={[
          {
            header: "ID",
            accessorKey: "id",
          },
          {
            header: "Tên",
            accessorKey: "name",
            cell: (row) => (
              <div className="flex items-center gap-3">
                {row.images && row.images[0] ? (
                  <img 
                    src={row.images[0].src} 
                    alt={row.name} 
                    className="w-10 h-10 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-md" />
                )}
                <Link to={`/products/${row.id}`} className="font-medium hover:underline text-primary">
                  {row.name}
                </Link>
              </div>
            ),
          },
          {
            header: "SKU",
            accessorKey: "sku",
          },
          {
            header: "Giá",
            accessorKey: "price",
            cell: (row) => formatCurrency(parseFloat(row.price || "0")),
          },
          {
            header: "Tồn kho",
            accessorKey: "stock_quantity",
            cell: (row) => {
              if (!row.manage_stock) return "N/A";
              if (row.stock_quantity === null) return "N/A";
              
              // Display warning if stock is low
              if (row.stock_quantity <= 5) {
                return (
                  <span className="text-red-600 font-semibold">
                    {row.stock_quantity}
                  </span>
                );
              }
              
              return row.stock_quantity;
            },
          },
          {
            header: "Trạng thái",
            accessorKey: "status",
            cell: (row) => <StatusBadge status={row.status} type="product" />,
          },
          {
            header: "Thao tác",
            accessorKey: "id",
            cell: (row) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/products/${row.id}`}>Chi tiết</Link>
                </Button>
              </div>
            ),
          },
        ]}
        data={data || []}
        searchPlaceholder="Tìm kiếm sản phẩm..."
        onSearch={handleSearch}
        isPending={isPending}
        pagination={{
          pageIndex: searchParams.page ? searchParams.page - 1 : 0,
          pageCount: 10, // Hardcoded for now, would ideally come from API
          onPageChange: handlePageChange,
        }}
      />
    </div>
  );
};

export default Products;
