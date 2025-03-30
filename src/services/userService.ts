
import { wpApiClient } from "./apiConfig";
import { toast } from "sonner";

export interface User {
  id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  url: string;
  description: string;
  link: string;
  locale: string;
  nickname: string;
  slug: string;
  registered_date: string;
  roles: string[];
  capabilities: Record<string, boolean>;
  extra_capabilities: Record<string, boolean>;
  avatar_urls: Record<string, string>;
  meta: any[];
}

export interface UserSearchParams {
  search?: string;
  role?: string;
  per_page?: number;
  page?: number;
}

export const getUsers = async (params?: UserSearchParams) => {
  try {
    console.log("Fetching users with params:", params);
    const response = await wpApiClient.get<User[]>("/users", { params });
    console.log("Users API response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    let errorMessage = error.response?.data?.message || error.message || "Lỗi khi tải dữ liệu người dùng";
    
    // Phát hiện lỗi xác thực từ WordPress
    if (error.response?.status === 401) {
      errorMessage = "Xác thực thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu của bạn.";
      
      // Thêm chi tiết lỗi
      const wpError = error.response?.data?.code;
      if (wpError === 'invalid_username') {
        errorMessage = "Tên đăng nhập WordPress không hợp lệ hoặc không tồn tại.";
      } else if (wpError === 'incorrect_password') {
        errorMessage = "Mật khẩu ứng dụng không chính xác.";
      }
    } else if (error.response?.status === 403) {
      errorMessage = "Bạn không có quyền truy cập vào danh sách người dùng.";
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

export const getUser = async (id: number) => {
  try {
    const response = await wpApiClient.get<User>(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching user ${id}:`, error);
    const errorMessage = error.response?.data?.message || error.message || "Lỗi khi tải thông tin người dùng";
    toast.error(errorMessage);
    throw error;
  }
};

export const createUser = async (userData: Partial<User> & { password: string }) => {
  try {
    const response = await wpApiClient.post<User>("/users", userData);
    toast.success("Tạo người dùng thành công");
    return response.data;
  } catch (error: any) {
    console.error("Error creating user:", error);
    const errorMessage = error.response?.data?.message || error.message || "Lỗi khi tạo người dùng";
    toast.error(errorMessage);
    throw error;
  }
};

export const updateUser = async (id: number, userData: Partial<User>) => {
  try {
    const response = await wpApiClient.put<User>(`/users/${id}`, userData);
    toast.success("Cập nhật người dùng thành công");
    return response.data;
  } catch (error: any) {
    console.error(`Error updating user ${id}:`, error);
    const errorMessage = error.response?.data?.message || error.message || "Lỗi khi cập nhật người dùng";
    toast.error(errorMessage);
    throw error;
  }
};

export const deleteUser = async (id: number) => {
  try {
    const response = await wpApiClient.delete(`/users/${id}`);
    toast.success("Xóa người dùng thành công");
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting user ${id}:`, error);
    const errorMessage = error.response?.data?.message || error.message || "Lỗi khi xóa người dùng";
    toast.error(errorMessage);
    throw error;
  }
};

export const getUserRoles = async () => {
  try {
    const response = await wpApiClient.get("/users/me?context=edit");
    const currentUser = response.data;
    return Object.keys(currentUser.capabilities || {});
  } catch (error: any) {
    console.error("Error fetching user roles:", error);
    const errorMessage = error.response?.data?.message || error.message || "Lỗi khi lấy danh sách vai trò";
    toast.error(errorMessage);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await wpApiClient.get<User>("/users/me?context=edit");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    const errorMessage = error.response?.data?.message || error.message || "Lỗi khi lấy thông tin người dùng hiện tại";
    toast.error(errorMessage);
    throw error;
  }
};

// Hàm kiểm tra kết nối đến WordPress REST API
export const testWordPressApiConnection = async () => {
  try {
    const response = await wpApiClient.get("/users/me");
    console.log("WordPress API connection test:", response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("WordPress API connection test failed:", error);
    const status = error.response?.status || 'unknown';
    let errorMessage = error.response?.data?.message || error.message || `Lỗi kết nối (${status})`;
    
    // Thêm thông tin chi tiết hơn về lỗi xác thực
    if (status === 401) {
      const wpError = error.response?.data?.code;
      if (wpError === 'invalid_username') {
        errorMessage = "Tên đăng nhập WordPress không hợp lệ hoặc không tồn tại.";
      } else if (wpError === 'incorrect_password') {
        errorMessage = "Mật khẩu ứng dụng không chính xác.";
      } else {
        errorMessage = "Xác thực thất bại. Tên đăng nhập hoặc mật khẩu không đúng.";
      }
    } else if (status === 403) {
      errorMessage = "Tài khoản của bạn không có đủ quyền truy cập API.";
    }
    
    return { 
      success: false, 
      error: errorMessage,
      status: status,
      details: error.response?.data || {}
    };
  }
};
