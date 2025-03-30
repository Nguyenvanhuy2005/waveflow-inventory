
import { useQuery } from "@tanstack/react-query";
import { getProductCategories, getProductAttributes, getProductAttributeTerms } from "@/services/productService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralTab from "./tabs/GeneralTab";
import InventoryTab from "./tabs/InventoryTab";
import AttributesTab from "./tabs/AttributesTab";

interface ProductTabsProps {
  form: any;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  selectedImages: File[];
  imagePreviewUrls: string[];
  selectedAttributes: any[];
  setSelectedAttributes: (attributes: any[]) => void;
  setSelectedImages: (files: File[]) => void;
  setImagePreviewUrls: (urls: string[]) => void;
}

const ProductTabs = ({
  form,
  selectedTab,
  setSelectedTab,
  selectedImages,
  imagePreviewUrls,
  selectedAttributes,
  setSelectedAttributes,
  setSelectedImages,
  setImagePreviewUrls
}: ProductTabsProps) => {
  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => getProductCategories(),
  });

  const { data: attributes } = useQuery({
    queryKey: ["product-attributes"],
    queryFn: () => getProductAttributes(),
  });

  // Lấy danh sách các giá trị của thuộc tính
  const { data: attributeTerms } = useQuery({
    queryKey: ["attribute-terms", selectedAttributes.map(attr => attr.id)],
    queryFn: async () => {
      const results: Record<number, any[]> = {};
      for (const attr of selectedAttributes) {
        if (attr.id) {
          const terms = await getProductAttributeTerms(attr.id);
          results[attr.id] = terms;
        }
      }
      return results;
    },
    enabled: selectedAttributes.length > 0,
  });

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
      <TabsList className="grid grid-cols-3 md:w-[600px]">
        <TabsTrigger value="general">Thông tin cơ bản</TabsTrigger>
        <TabsTrigger value="inventory">Kho hàng</TabsTrigger>
        <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <GeneralTab 
          form={form} 
          categories={categories} 
          imagePreviewUrls={imagePreviewUrls}
          setImagePreviewUrls={setImagePreviewUrls}
          setSelectedImages={setSelectedImages}
        />
      </TabsContent>
      
      <TabsContent value="inventory">
        <InventoryTab form={form} />
      </TabsContent>
      
      <TabsContent value="attributes">
        <AttributesTab 
          attributes={attributes} 
          selectedAttributes={selectedAttributes}
          setSelectedAttributes={setSelectedAttributes}
          attributeTerms={attributeTerms}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProductTabs;
