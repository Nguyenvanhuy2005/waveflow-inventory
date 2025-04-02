
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, ProductSearchParams, getProductVariations } from "@/services/productService";
import { DataTable } from "@/components/DataTable";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

const Products = () => {
  const [searchParams, setSearchParams] = useState<ProductSearchParams>({
    per_page: 10,
    page: 1,
  });

  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

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

  const toggleProductExpansion = (productId: number) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Define columns with proper typing
  const columns: ColumnDef<any, any>[] = [
    {
      header: "",
      id: "expand",
      cell: ({ row }) => {
        const product = row.original;
        // Only show expand button for variable products
        if (product.type !== 'variable' || !product.variations || product.variations.length === 0) {
          return null;
        }
        
        const isExpanded = expandedProducts[product.id] || false;
        
        return (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleProductExpansion(product.id);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        );
      },
    },
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Tên",
      accessorKey: "name",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            {product.images && product.images[0] ? (
              <img 
                src={product.images[0].src} 
                alt={product.name} 
                className="w-10 h-10 object-cover rounded-md"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-md" />
            )}
            <span className="font-medium">{product.name}</span>
          </div>
        );
      },
    },
    {
      header: "SKU",
      accessorKey: "sku",
    },
    {
      header: "Giá",
      accessorKey: "price",
      cell: ({ row }) => formatCurrency(parseFloat(row.original.price || "0")),
    },
    {
      header: "Tồn kho",
      accessorKey: "stock_quantity",
      cell: ({ row }) => {
        const product = row.original;
        if (!product.manage_stock) return "N/A";
        if (product.stock_quantity === null) return "N/A";
        
        // Display warning if stock is low
        if (product.stock_quantity <= 5) {
          return (
            <span className="text-red-600 font-semibold">
              {product.stock_quantity}
            </span>
          );
        }
        
        return product.stock_quantity;
      },
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} type="product" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sản phẩm</h1>
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        searchPlaceholder="Tìm kiếm sản phẩm..."
        onSearch={handleSearch}
        isPending={isPending}
        pagination={{
          pageIndex: searchParams.page ? searchParams.page - 1 : 0,
          pageCount: 10, // Hardcoded for now, would ideally come from API
          onPageChange: handlePageChange,
        }}
        renderSubComponent={(row) => {
          const product = row.original;
          return <ProductVariationsTable productId={product.id} />;
        }}
        getRowCanExpand={(row) => row.type === 'variable' && row.variations && row.variations.length > 0}
        expandedRows={expandedProducts}
      />
    </div>
  );
};

// Component to display variations of a product
const ProductVariationsTable = ({ productId }: { productId: number }) => {
  const { data: variations, isPending } = useQuery({
    queryKey: ["product-variations", productId],
    queryFn: () => getProductVariations(productId),
  });

  if (isPending) {
    return <div className="p-4">Đang tải biến thể sản phẩm...</div>;
  }

  if (!variations || variations.length === 0) {
    return <div className="p-4">Không có biến thể nào cho sản phẩm này.</div>;
  }

  return (
    <div className="p-4 bg-muted/30 rounded-md">
      <h3 className="text-sm font-medium mb-2">Biến thể sản phẩm ({variations.length})</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-2 py-1 text-left">Biến thể</th>
            <th className="px-2 py-1 text-left">SKU</th>
            <th className="px-2 py-1 text-left">Giá</th>
            <th className="px-2 py-1 text-left">Giá KM</th>
            <th className="px-2 py-1 text-left">Tồn kho</th>
          </tr>
        </thead>
        <tbody>
          {variations.map(variation => (
            <tr key={variation.id} className="border-b border-muted hover:bg-muted/20">
              <td className="px-2 py-2">
                {variation.attributes && variation.attributes.map((attr, idx) => (
                  <div key={idx}>
                    <span className="font-medium">{attr.name}:</span> {attr.option}
                  </div>
                ))}
              </td>
              <td className="px-2 py-2">{variation.sku}</td>
              <td className="px-2 py-2">{formatCurrency(parseFloat(variation.regular_price || "0"))}</td>
              <td className="px-2 py-2">{variation.sale_price ? formatCurrency(parseFloat(variation.sale_price || "0")) : "-"}</td>
              <td className="px-2 py-2">
                {variation.manage_stock ? 
                  (variation.stock_quantity !== null && variation.stock_quantity <= 5) ? 
                    <span className="text-red-600 font-semibold">{variation.stock_quantity}</span> : 
                    variation.stock_quantity 
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
