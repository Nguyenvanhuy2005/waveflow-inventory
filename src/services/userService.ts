
import { wpApiClient } from "./apiConfig";

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
  const response = await wpApiClient.get<User[]>("/users", { params });
  return response.data;
};

export const getUser = async (id: number) => {
  const response = await wpApiClient.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: Partial<User> & { password: string }) => {
  const response = await wpApiClient.post<User>("/users", userData);
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<User>) => {
  const response = await wpApiClient.put<User>(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await wpApiClient.delete(`/users/${id}`);
  return response.data;
};

export const getUserRoles = async () => {
  const response = await wpApiClient.get("/users/me?context=edit");
  const currentUser = response.data;
  return Object.keys(currentUser.capabilities || {});
};

export const getCurrentUser = async () => {
  const response = await wpApiClient.get<User>("/users/me?context=edit");
  return response.data;
};
