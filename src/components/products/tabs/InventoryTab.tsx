
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface InventoryTabProps {
  form: any;
}

const InventoryTab = ({ form }: InventoryTabProps) => {
  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý kho hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="manage_stock"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Quản lý tồn kho</FormLabel>
                  <FormDescription>
                    Bật tính năng quản lý tồn kho cho sản phẩm này
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch("manage_stock") && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng tồn kho</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái kho hàng</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="instock">Còn hàng</SelectItem>
                        <SelectItem value="outofstock">Hết hàng</SelectItem>
                        <SelectItem value="onbackorder">Đặt trước</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="backorders"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cho phép đặt hàng khi hết</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                  disabled={!form.watch("manage_stock")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cài đặt" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no">Không</SelectItem>
                    <SelectItem value="notify">Có, thông báo cho khách</SelectItem>
                    <SelectItem value="yes">Có, không thông báo cho khách</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sold_individually"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Bán riêng lẻ</FormLabel>
                  <FormDescription>
                    Giới hạn mỗi đơn hàng chỉ có thể mua 1 sản phẩm này
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryTab;
