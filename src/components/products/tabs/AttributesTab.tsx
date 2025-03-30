
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Search, Trash2, AlertCircle, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

interface AttributesTabProps {
  attributes?: any[];
  selectedAttributes: any[];
  attributeTerms?: Record<number, any[]>;
  setSelectedAttributes: (attributes: any[]) => void;
  isLoadingTerms?: boolean;
}

const AttributesTab = ({ 
  attributes, 
  selectedAttributes, 
  attributeTerms,
  setSelectedAttributes,
  isLoadingTerms = false
}: AttributesTabProps) => {
  // Initialize state variables first
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});
  
  // Now the useEffect can safely access both variables
  useEffect(() => {
    if (selectedAttributes) {
      // Initialize search terms and option values for all attributes
      const updatedSearchTerms = { ...searchTerms };
      const updatedOptionValues = { ...newOptionValues };
      
      selectedAttributes.forEach(attr => {
        if (!updatedSearchTerms[attr.id]) {
          updatedSearchTerms[attr.id] = '';
        }
        if (!updatedOptionValues[attr.id]) {
          updatedOptionValues[attr.id] = '';
        }
      });
      
      setSearchTerms(updatedSearchTerms);
      setNewOptionValues(updatedOptionValues);
    }
  }, [selectedAttributes]);
  
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

  // Function to clear all options for an attribute
  const clearAttributeOptions = (attributeId: number) => {
    setSelectedAttributes(
      selectedAttributes.map(attr => {
        if (attr.id === attributeId) {
          return { ...attr, options: [] };
        }
        return attr;
      })
    );
    toast.info("Đã xóa tất cả giá trị thuộc tính");
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

  // Function to add multiple attribute options
  const addMultipleOptions = (attributeId: number, options: string[]) => {
    if (!options || options.length === 0) return;
    
    setSelectedAttributes(
      selectedAttributes.map(attr => {
        if (attr.id === attributeId) {
          // Filter out options that already exist
          const uniqueNewOptions = options.filter(option => !attr.options.includes(option));
          
          if (uniqueNewOptions.length === 0) {
            // No new options to add
            return attr;
          }
          
          return { ...attr, options: [...attr.options, ...uniqueNewOptions] };
        }
        return attr;
      })
    );
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

  // Add selected terms from the filtered list
  const addSelectedTerms = (attributeId: number, selectedTerms: any[]) => {
    if (!selectedTerms || selectedTerms.length === 0) return;
    
    const optionsToAdd = selectedTerms.map(term => term.name);
    addMultipleOptions(attributeId, optionsToAdd);
    toast.success(`Đã thêm ${optionsToAdd.length} giá trị thuộc tính`);
  };
  
  // Function to select all terms for an attribute
  const selectAllTerms = (attributeId: number) => {
    if (!attributeTerms || !attributeTerms[attributeId]) return;
    
    const allTermNames = attributeTerms[attributeId].map(term => term.name);
    addMultipleOptions(attributeId, allTermNames);
    toast.success(`Đã thêm tất cả ${allTermNames.length} giá trị thuộc tính`);
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
                  <div className="flex justify-between items-center">
                    <Label>Giá trị thuộc tính đã chọn ({attr.options.length})</Label>
                    {attr.options.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => clearAttributeOptions(attr.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Xóa tất cả
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/20">
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
                      <p className="text-sm text-muted-foreground py-1">Chưa có giá trị nào được chọn</p>
                    )}
                  </div>
                </div>
                
                {/* Search existing attribute values */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Tìm và thêm giá trị có sẵn</Label>
                    
                    {isLoadingTerms ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />
                        Đang tải...
                      </div>
                    ) : attributeTerms && attributeTerms[attr.id]?.length > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllTerms(attr.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Thêm tất cả
                      </Button>
                    ) : null}
                  </div>
                  
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
                  
                  {isLoadingTerms ? (
                    <div className="flex justify-center items-center py-4">
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Đang tải giá trị thuộc tính...</span>
                    </div>
                  ) : attributeTerms && attr.id > 0 ? (
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                      {attributeTerms[attr.id] && attributeTerms[attr.id].length > 0 ? (
                        <>
                          {getFilteredTerms(attr.id).length > 0 ? (
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
                              Không tìm thấy giá trị phù hợp với "{searchTerms[attr.id]}"
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-3 gap-2">
                          <AlertCircle className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm text-center text-muted-foreground">
                            Thuộc tính này chưa có giá trị được định nghĩa
                          </p>
                        </div>
                      )}
                    </div>
                  ) : attr.id === 0 ? (
                    // Custom attribute with ID 0 doesn't have terms from the API
                    <div className="text-sm text-muted-foreground py-2">
                      Thuộc tính tùy chỉnh không có giá trị có sẵn
                    </div>
                  ) : (
                    <div className="flex justify-center items-center py-4">
                      <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Không thể tải giá trị thuộc tính</span>
                    </div>
                  )}
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
                      disabled={!newOptionValues[attr.id]?.trim()}
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
