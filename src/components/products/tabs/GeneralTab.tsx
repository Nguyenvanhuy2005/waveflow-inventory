import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeneralTabProps {
  form: any;
  categories?: any[];
  imagePreviewUrls: string[];
  setImagePreviewUrls: (urls: string[]) => void;
  setSelectedImages: (files: File[]) => void;
}

const GeneralTab = ({ form, categories, imagePreviewUrls, setImagePreviewUrls, setSelectedImages }: GeneralTabProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFiles = [...filesArray];
      setSelectedImages(newFiles);
      
      // Tạo URL để xem trước hình ảnh
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...newImageUrls]);
    }
  };

  const removeImage = (index: number) => {
    const newSelectedImages = imagePreviewUrls.filter((_, i) => i !== index);
    setSelectedImages([]);
    
    // Revoke URL để tránh rò rỉ bộ nhớ
    URL.revokeObjectURL(imagePreviewUrls[index]);
    const newImagePreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    setImagePreviewUrls(newImagePreviewUrls);
  };

  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên sản phẩm <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã SKU</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="publish">Đang bán</SelectItem>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="pending">Chờ phê duyệt</SelectItem>
                      <SelectItem value="private">Riêng tư</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Sản phẩm nổi bật</FormLabel>
                  <FormDescription>
                    Hiển thị sản phẩm này trong danh sách nổi bật
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả đầy đủ</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="regular_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá thường</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá khuyến mãi</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Danh mục sản phẩm */}
          <div className="space-y-2">
            <Label>Danh mục</Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {categories?.map((category) => (
                <div 
                  key={category.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox 
                    id={`category-${category.id}`}
                    checked={form.watch("categories")?.includes(category.id)}
                    onCheckedChange={(checked) => {
                      const currentCategories = form.getValues("categories") || [];
                      if (checked) {
                        form.setValue("categories", [...currentCategories, category.id]);
                      } else {
                        form.setValue("categories", 
                          currentCategories.filter(id => id !== category.id)
                        );
                      }
                    }}
                  />
                  <label 
                    htmlFor={`category-${category.id}`}
                    className="text-sm"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quản lý hình ảnh */}
          <div className="space-y-4">
            <Label>Hình ảnh sản phẩm</Label>
            <div className="flex flex-wrap gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div 
                  key={index} 
                  className="relative h-24 w-24 rounded-md border border-gray-200"
                >
                  <img 
                    src={url} 
                    alt={`Product ${index}`} 
                    className="h-full w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label 
                htmlFor="image-upload"
                className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 hover:bg-gray-50"
              >
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="mt-1 text-xs text-gray-500">Thêm ảnh</span>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralTab;
