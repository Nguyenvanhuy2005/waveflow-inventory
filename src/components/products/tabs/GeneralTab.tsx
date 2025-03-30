
import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, X, Plus, Upload } from "lucide-react";

interface GeneralTabProps {
  form: any;
  categories?: any[];
  imagePreviewUrls: string[];
  setImagePreviewUrls: (urls: string[]) => void;
  setSelectedImages: (files: File[]) => void;
  productType: string;
  setProductType: (type: string) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ 
  form, 
  categories = [], 
  imagePreviewUrls,
  setImagePreviewUrls,
  setSelectedImages,
  productType,
  setProductType
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    form.getValues("categories") || []
  );

  // Set product type to variable by default
  React.useEffect(() => {
    setProductType("variable");
    form.setValue("type", "variable");
  }, []);

  // Handle category selection
  const handleCategoryChange = (categoryId: number) => {
    const isSelected = selectedCategoryIds.includes(categoryId);
    
    let updatedCategories;
    if (isSelected) {
      // Remove category if already selected
      updatedCategories = selectedCategoryIds.filter(id => id !== categoryId);
    } else {
      // Add category if not selected
      updatedCategories = [...selectedCategoryIds, categoryId];
    }
    
    setSelectedCategoryIds(updatedCategories);
    form.setValue("categories", updatedCategories);
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    const validFiles: File[] = [];
    const validFileUrls: string[] = [];
    
    Array.from(files).forEach(file => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Kích thước ảnh quá lớn. Tối đa 5MB cho mỗi ảnh.");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError("Chỉ chấp nhận file ảnh (jpg, png, gif, webp).");
        return;
      }
      
      validFiles.push(file);
      validFileUrls.push(URL.createObjectURL(file));
    });
    
    if (validFiles.length > 0) {
      setSelectedImages(validFiles);
      const newUrls = [...imagePreviewUrls, ...validFileUrls];
      setImagePreviewUrls(newUrls);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove image from preview
  const removeImage = (index: number) => {
    const updatedUrls = [...imagePreviewUrls];
    updatedUrls.splice(index, 1);
    setImagePreviewUrls(updatedUrls);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên sản phẩm</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên sản phẩm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Giá sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="regular_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá gốc</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: 100000" {...field} />
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
                    <Input placeholder="Ví dụ: 80000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`category-${category.id}`}>{category.name}</label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Đang tải danh mục...</p>
              )}
            </div>
            {(selectedCategoryIds.length > 0 && categories) && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Danh mục đã chọn:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategoryIds.map(id => {
                    const category = categories.find(c => c.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {category?.name}
                        <button 
                          type="button" 
                          onClick={() => handleCategoryChange(id)} 
                          className="ml-1 rounded-full hover:bg-muted p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Hình ảnh sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div 
                  key={index}
                  className="relative aspect-square border rounded-md overflow-hidden group"
                >
                  <img 
                    src={url} 
                    alt={`Product preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={triggerFileInput}
                className="flex flex-col items-center justify-center aspect-square border border-dashed rounded-md hover:bg-muted/50 transition-colors"
              >
                <Plus className="h-8 w-8 mb-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thêm ảnh</span>
              </button>
            </div>

            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            {uploadError && (
              <p className="text-red-500 text-sm mt-2">{uploadError}</p>
            )}

            <div className="flex justify-center">
              <Button type="button" variant="outline" onClick={triggerFileInput}>
                <Upload className="h-4 w-4 mr-2" />
                Tải ảnh lên
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái sản phẩm</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish">Đã đăng (Publish)</SelectItem>
                    <SelectItem value="draft">Bản nháp (Draft)</SelectItem>
                    <SelectItem value="pending">Chờ duyệt (Pending)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Sản phẩm nổi bật</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Đánh dấu sản phẩm này là sản phẩm nổi bật
                  </p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralTab;
