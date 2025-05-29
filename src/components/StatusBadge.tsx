
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  type: "order" | "product" | "general";
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  let statusColor = "";
  let statusText = status;

  if (type === "order") {
    switch (status) {
      case "pending":
        statusColor = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
        statusText = "Chờ xử lý";
        break;
      case "processing":
        statusColor = "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
        statusText = "Đang xử lý";
        break;
      case "on-hold":
        statusColor = "bg-orange-100 text-orange-800 hover:bg-orange-100/80";
        statusText = "Tạm giữ";
        break;
      case "completed":
        statusColor = "bg-green-100 text-green-800 hover:bg-green-100/80";
        statusText = "Hoàn thành";
        break;
      case "cancelled":
        statusColor = "bg-red-100 text-red-800 hover:bg-red-100/80";
        statusText = "Đã hủy";
        break;
      case "refunded":
        statusColor = "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
        statusText = "Đã hoàn tiền";
        break;
      case "failed":
        statusColor = "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
        statusText = "Thất bại";
        break;
      default:
        statusColor = "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
        break;
    }
  } else if (type === "product") {
    switch (status) {
      case "publish":
        statusColor = "bg-green-100 text-green-800 hover:bg-green-100/80";
        statusText = "Đang bán";
        break;
      case "draft":
        statusColor = "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
        statusText = "Bản nháp";
        break;
      case "pending":
        statusColor = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
        statusText = "Chờ phê duyệt";
        break;
      case "private":
        statusColor = "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
        statusText = "Riêng tư";
        break;
      default:
        statusColor = "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
        break;
    }
  } else if (type === "general") {
    switch (status) {
      case "active":
        statusColor = "bg-green-100 text-green-800 hover:bg-green-100/80";
        statusText = "Hoạt động";
        break;
      case "inactive":
        statusColor = "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
        statusText = "Không hoạt động";
        break;
      case "pending":
        statusColor = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
        statusText = "Chờ xử lý";
        break;
      case "completed":
        statusColor = "bg-green-100 text-green-800 hover:bg-green-100/80";
        statusText = "Hoàn thành";
        break;
      case "approved":
        statusColor = "bg-green-100 text-green-800 hover:bg-green-100/80";
        statusText = "Đã phê duyệt";
        break;
      case "rejected":
        statusColor = "bg-red-100 text-red-800 hover:bg-red-100/80";
        statusText = "Từ chối";
        break;
      case "reported":
        statusColor = "bg-orange-100 text-orange-800 hover:bg-orange-100/80";
        statusText = "Đã báo cáo";
        break;
      case "processed":
        statusColor = "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
        statusText = "Đã xử lý";
        break;
      default:
        statusColor = "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
        break;
    }
  }

  return (
    <Badge variant="outline" className={cn(statusColor, className)}>
      {statusText}
    </Badge>
  );
}
