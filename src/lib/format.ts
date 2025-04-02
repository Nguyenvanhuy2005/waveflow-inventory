
export const formatCurrency = (
  amount: number, 
  options: Intl.NumberFormatOptions = {}
): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    ...options,
  }).format(amount);
};

export const formatDate = (
  dateString: string,
  format: string = "dd/MM/yyyy HH:mm"
): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    
    return format
      .replace("dd", day)
      .replace("MM", month)
      .replace("yyyy", year.toString())
      .replace("HH", hours)
      .replace("mm", minutes);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export const getRelativeTimeString = (dateString: string): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    const diffWeeks = Math.round(diffDays / 7);
    const diffMonths = Math.round(diffDays / 30);
    const diffYears = Math.round(diffDays / 365);

    if (diffSecs < 60) {
      return "Vừa xong";
    } else if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} tuần trước`;
    } else if (diffMonths < 12) {
      return `${diffMonths} tháng trước`;
    } else {
      return `${diffYears} năm trước`;
    }
  } catch (error) {
    console.error("Error calculating relative time:", error);
    return dateString;
  }
};
