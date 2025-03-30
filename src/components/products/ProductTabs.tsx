
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

  // Fetch all attribute terms for all attributes upfront
  const { data: attributeTerms, isLoading: loadingTerms } = useQuery({
    queryKey: ["all-attribute-terms", attributes?.map(attr => attr.id)],
    queryFn: async () => {
      const results: Record<number, any[]> = {};
      
      if (!attributes || attributes.length === 0) {
        return results;
      }

      // Fetch terms for all available attributes, not just selected ones
      for (const attr of attributes) {
        try {
          // Skip custom attributes with id = 0
          if (attr.id > 0) {
            const terms = await getProductAttributeTerms(attr.id);
            results[attr.id] = terms;
          }
        } catch (error) {
          console.error(`Error fetching terms for attribute ${attr.id}:`, error);
          results[attr.id] = [];
        }
      }
      return results;
    },
    enabled: !!attributes && attributes.length > 0,
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
          isLoadingTerms={loadingTerms}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProductTabs;
