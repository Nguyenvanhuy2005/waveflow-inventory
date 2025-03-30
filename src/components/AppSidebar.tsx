
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, Package, ShoppingCart, Users, User2, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Menu items
const items = [
  {
    title: "Tổng quan",
    path: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Sản phẩm",
    path: "/products",
    icon: Package,
  },
  {
    title: "Đơn hàng",
    path: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Khách hàng",
    path: "/customers",
    icon: Users,
  },
  {
    title: "Người dùng",
    path: "/users",
    icon: User2,
  },
  {
    title: "Cài đặt",
    path: "/settings",
    icon: Settings,
  },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-4 py-6">
          <h2 className="text-xl font-bold text-sidebar-primary">
            StockWave Harmony
          </h2>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.path}
                      className={({ isActive }) => 
                        cn("flex items-center gap-3 py-2", isActive && "text-sidebar-primary font-medium")
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
