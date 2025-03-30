
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface AttributesTabProps {
  attributes?: any[];
  selectedAttributes: any[];
  attributeTerms?: Record<number, any[]>;
  setSelectedAttributes: (attributes: any[]) => void;
}

const AttributesTab = ({ 
  attributes, 
  selectedAttributes, 
  attributeTerms,
  setSelectedAttributes
}: AttributesTabProps) => {
  // Hàm xử lý thêm thuộc tính mới
  const addAttribute = (attributeId: number, attributeName: string) => {
    // Kiểm tra xem thuộc tính đã tồn tại chưa
    const exists = selectedAttributes.some(attr => attr.id === attributeId);
    if (exists) {
      toast.error("Thuộc tính này đã được thêm");
      return;
    }

    // Thêm thuộc tính mới
    const newAttribute = {
      id: attributeId,
      name: attributeName,
      position: selectedAttributes.length,
      visible: true,
      variation: false,
      options: [] as string[],
    };
    setSelectedAttributes([...selectedAttributes, newAttribute]);
  };

  // Hàm xử lý xóa thuộc tính
  const removeAttribute = (attributeId: number) => {
    setSelectedAttributes(selectedAttributes.filter(attr => attr.id !== attributeId));
  };

  // Cập nhật giá trị thuộc tính
  const updateAttributeOptions = (attributeId: number, options: string[]) => {
    setSelectedAttributes(
      selectedAttributes.map(attr => 
        attr.id === attributeId ? { ...attr, options } : attr
      )
    );
  };

  // Thêm giá trị thuộc tính
  const addAttributeOption = (attributeId: number, option: string) => {
    setSelectedAttributes(
      selectedAttributes.map(attr => {
        if (attr.id === attributeId) {
          // Kiểm tra xem option đã tồn tại chưa
          if (attr.options.includes(option)) {
            return attr;
          }
          return { ...attr, options: [...attr.options, option] };
        }
        return attr;
      })
    );
  };

  // Xóa giá trị thuộc tính
  const removeAttributeOption = (attributeId: number, option: string) => {
    setSelectedAttributes(
      selectedAttributes.map(attr => {
        if (attr.id === attributeId) {
          return { ...attr, options: attr.options.filter(opt => opt !== option) };
        }
        return attr;
      })
    );
  };

  // Cập nhật cài đặt thuộc tính
  const updateAttributeSetting = (attributeId: number, key: string, value: boolean) => {
    setSelectedAttributes(
      selectedAttributes.map(attr => {
        if (attr.id === attributeId) {
          return { ...attr, [key]: value };
        }
        return attr;
      })
    );
  };

  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Thuộc tính sản phẩm</CardTitle>
          <Select
            onValueChange={(value) => {
              const selectedAttr = attributes?.find(attr => attr.id.toString() === value);
              if (selectedAttr) {
                addAttribute(selectedAttr.id, selectedAttr.name);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Thêm thuộc tính" />
            </SelectTrigger>
            <SelectContent>
              {attributes?.map(attr => (
                <SelectItem 
                  key={attr.id} 
                  value={attr.id.toString()}
                  disabled={selectedAttributes.some(a => a.id === attr.id)}
                >
                  {attr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedAttributes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Chưa có thuộc tính nào được thêm
            </p>
          ) : (
            selectedAttributes.map((attr) => (
              <div key={attr.id} className="border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{attr.name}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeAttribute(attr.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`visible-${attr.id}`}
                      checked={attr.visible}
                      onCheckedChange={(checked) => 
                        updateAttributeSetting(attr.id, 'visible', !!checked)
                      }
                    />
                    <label htmlFor={`visible-${attr.id}`}>Hiển thị</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`variation-${attr.id}`}
                      checked={attr.variation}
                      onCheckedChange={(checked) => 
                        updateAttributeSetting(attr.id, 'variation', !!checked)
                      }
                    />
                    <label htmlFor={`variation-${attr.id}`}>Dùng cho biến thể</label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Giá trị thuộc tính</Label>
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map((option: string) => (
                      <Badge 
                        key={option} 
                        className="py-1 px-2 flex items-center gap-1"
                        variant="secondary"
                      >
                        {option}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 rounded-full"
                          onClick={() => removeAttributeOption(attr.id, option)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) => addAttributeOption(attr.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn giá trị" />
                    </SelectTrigger>
                    <SelectContent>
                      {attributeTerms && attributeTerms[attr.id]?.map((term: any) => (
                        <SelectItem 
                          key={term.id} 
                          value={term.name}
                          disabled={attr.options.includes(term.name)}
                        >
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Hoặc nhập giá trị mới"
                      className="w-64"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value) {
                            addAttributeOption(attr.id, value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        const input = (e.currentTarget.previousSibling as HTMLInputElement);
                        const value = input.value.trim();
                        if (value) {
                          addAttributeOption(attr.id, value);
                          input.value = '';
                        }
                      }}
                    >
                      Thêm
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttributesTab;
