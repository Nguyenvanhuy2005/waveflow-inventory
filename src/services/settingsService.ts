
import axios from "axios";
import { ApiCredentials, STOCKWAVE_API_BASE_URL, storeCredentials, wcApiClient } from "./apiConfig";

export const saveApiCredentials = async (credentials: ApiCredentials) => {
  storeCredentials(credentials);
  return { success: true };
};

export const testApiConnection = async () => {
  try {
    const response = await wcApiClient.get("/products", {
      params: { per_page: 1 },
    });
    
    return {
      success: true,
      message: "Kết nối thành công với API",
      data: response.data,
    };
  } catch (error) {
    console.error("API connection test failed:", error);
    return {
      success: false,
      message: "Kết nối thất bại. Vui lòng kiểm tra thông tin đăng nhập.",
      error,
    };
  }
};

// Các hàm dành cho API tùy chỉnh
export const saveStockwaveSettings = async (
  credentials: ApiCredentials
): Promise<{ success: boolean; message: string }> => {
  try {
    // Note: This is a mock function since we can't create the custom endpoints
    // In a real scenario, we would call the custom stockwave endpoint
    
    // For now, we'll just store in localStorage
    storeCredentials(credentials);
    
    return {
      success: true,
      message: "Đã lưu thông tin đăng nhập thành công.",
    };
  } catch (error) {
    console.error("Failed to save settings:", error);
    return {
      success: false,
      message: "Không thể lưu thông tin đăng nhập.",
    };
  }
};

export const getStockwaveSettings = async (): Promise<{
  success: boolean;
  data?: ApiCredentials;
  message?: string;
}> => {
  try {
    // Note: This is a mock function since we can't create the custom endpoints
    // In a real scenario, we would call the custom stockwave endpoint
    
    // For now, we'll just retrieve from localStorage
    const credentials = localStorage.getItem("stockwave_credentials");
    
    if (!credentials) {
      return {
        success: false,
        message: "Không tìm thấy thông tin đăng nhập.",
      };
    }
    
    return {
      success: true,
      data: JSON.parse(credentials) as ApiCredentials,
    };
  } catch (error) {
    console.error("Failed to get settings:", error);
    return {
      success: false,
      message: "Không thể lấy thông tin đăng nhập.",
    };
  }
};
