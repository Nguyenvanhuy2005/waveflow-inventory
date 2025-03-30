
import axios from "axios";
import { ApiCredentials, STOCKWAVE_API_BASE_URL, storeCredentials, wcApiClient } from "./apiConfig";

// Export the ApiCredentials interface for use in other files
export type { ApiCredentials };

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
  } catch (error: any) {
    console.error("API connection test failed:", error);
    
    let errorMessage = "Kết nối thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
    
    // Extract more detailed error messages when available
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "Xác thực thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.";
        
        // Additional context for specific WordPress auth errors
        const wpError = error.response.data?.code;
        if (wpError === 'invalid_username') {
          errorMessage = "Tên đăng nhập WordPress không hợp lệ hoặc không tồn tại.";
        } else if (wpError === 'incorrect_password') {
          errorMessage = "Mật khẩu ứng dụng không chính xác.";
        }
      } else if (error.response.status === 403) {
        errorMessage = "Tài khoản của bạn không có đủ quyền truy cập API.";
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    return {
      success: false,
      message: errorMessage,
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
