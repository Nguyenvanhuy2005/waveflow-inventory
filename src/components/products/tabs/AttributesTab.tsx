
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Search } from "lucide-react";
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
  // State for search term input
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});
  
  // Function to add new attribute
  const addAttribute = (attributeId: number, attributeName: string) => {
    // Check if attribute already exists
    const exists = selectedAttributes.some(attr => attr.id === attributeId);
    if (exists) {
      toast.error("Thuộc tính này đã được thêm");
      return;
    }

    // Add new attribute
    const newAttribute = {
      id: attributeId,
      name: attributeName,
      position: selectedAttributes.length,
      visible: true,
      variation: false,
      options: [] as string[],
    };
    setSelectedAttributes([...selectedAttributes, newAttribute]);
    
    // Initialize search term for this attribute
    setSearchTerms({...searchTerms, [attributeId]: ''});
    setNewOptionValues({...newOptionValues, [attributeId]: ''});
  };

  // Function to remove attribute
  const removeAttribute = (attributeId: number) => {
    setSelectedAttributes(selectedAttributes.filter(attr => attr.id !== attributeId));
    
    // Clean up search term for this attribute
    const newSearchTerms = {...searchTerms};
    delete newSearchTerms[attributeId];
    setSearchTerms(newSearchTerms);
    
    const newOptionValuesCopy = {...newOptionValues};
    delete newOptionValuesCopy[attributeId];
    setNewOptionValues(newOptionValuesCopy);
  };

  // Function to update attribute options
  const updateAttributeOptions = (attributeId: number, options: string[]) => {
    setSelectedAttributes(
      selectedAttributes.map(attr => 
        attr.id === attributeId ? { ...attr, options } : attr
      )
    );
  };

  // Function to add attribute option
  const addAttributeOption = (attributeId: number, option: string) => {
    if (!option.trim()) return;
    
    setSelectedAttributes(
      selectedAttributes.map(attr => {
        if (attr.id === attributeId) {
          // Check if option already exists
          if (attr.options.includes(option)) {
            toast.error(`Giá trị "${option}" đã tồn tại trong thuộc tính này`);
            return attr;
          }
          return { ...attr, options: [...attr.options, option] };
        }
        return attr;
      })
    );
    
    // Reset option input
    setNewOptionValues({...newOptionValues, [attributeId]: ''});
  };

  // Function to remove attribute option
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

  // Function to update attribute setting
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

  // Filter attribute terms based on search
  const getFilteredTerms = (attributeId: number) => {
    if (!attributeTerms || !attributeTerms[attributeId]) return [];
    
    const searchTerm = searchTerms[attributeId]?.toLowerCase() || '';
    if (!searchTerm) return attributeTerms[attributeId];
    
    return attributeTerms[attributeId].filter(term => 
      term.name.toLowerCase().includes(searchTerm)
    );
  };
  
  // Handle search input change
  const handleSearchChange = (attributeId: number, value: string) => {
    setSearchTerms({...searchTerms, [attributeId]: value});
  };
  
  // Handle new option input change
  const handleNewOptionChange = (attributeId: number, value: string) => {
    setNewOptionValues({...newOptionValues, [attributeId]: value});
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
                  <Label>Giá trị thuộc tính đã chọn</Label>
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
                    
                    {attr.options.length === 0 && (
                      <p className="text-sm text-muted-foreground">Chưa có giá trị nào được chọn</p>
                    )}
                  </div>
                </div>
                
                {/* Search existing attribute values */}
                <div className="space-y-3">
                  <Label>Tìm và thêm giá trị có sẵn</Label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm giá trị thuộc tính"
                        className="pl-8"
                        value={searchTerms[attr.id] || ''}
                        onChange={(e) => handleSearchChange(attr.id, e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {getFilteredTerms(attr.id)?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {getFilteredTerms(attr.id).map(term => (
                          <div key={term.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`term-${attr.id}-${term.id}`}
                              checked={attr.options.includes(term.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  addAttributeOption(attr.id, term.name);
                                } else {
                                  removeAttributeOption(attr.id, term.name);
                                }
                              }}
                            />
                            <label 
                              htmlFor={`term-${attr.id}-${term.id}`}
                              className="text-sm"
                            >
                              {term.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-center text-muted-foreground py-2">
                        {searchTerms[attr.id] ? 'Không tìm thấy giá trị phù hợp' : 'Danh sách giá trị trống'}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Add custom attribute value */}
                <div className="space-y-2">
                  <Label>Thêm giá trị mới</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Nhập giá trị thuộc tính mới"
                      className="flex-1"
                      value={newOptionValues[attr.id] || ''}
                      onChange={(e) => handleNewOptionChange(attr.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAttributeOption(attr.id, newOptionValues[attr.id] || '');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => addAttributeOption(attr.id, newOptionValues[attr.id] || '')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
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
