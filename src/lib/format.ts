
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
