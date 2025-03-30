
import { useQuery } from "@tanstack/react-query";
import { getProductCategories, getProductAttributes, getProductAttributeTerms } from "@/services/productService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralTab from "./tabs/GeneralTab";
import InventoryTab from "./tabs/InventoryTab";
import AttributesTab from "./tabs/AttributesTab";
import { VariationsTab } from "./tabs/variations";

interface ProductTabsProps {
  form: any;
  product: any;
  productId: number | null;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  selectedImages: File[];
  imagePreviewUrls: string[];
  selectedAttributes: any[];
  setSelectedAttributes: (attributes: any[]) => void;
  productType: string;
  setProductType: (type: string) => void;
  variations: any[];
  setVariations: (variations: any[]) => void;
  setSelectedImages: (files: File[]) => void;
  setImagePreviewUrls: (urls: string[]) => void;
  uploadVariationImage?: (productId: number | null, variationId: number | undefined, file: File) => Promise<any>;
  isUploadingImage?: boolean;
}

const ProductTabs = ({
  form,
  product,
  productId,
  selectedTab,
  setSelectedTab,
  selectedImages,
  imagePreviewUrls,
  selectedAttributes,
  setSelectedAttributes,
  productType,
  setProductType,
  variations,
  setVariations,
  setSelectedImages,
  setImagePreviewUrls,
  uploadVariationImage,
  isUploadingImage = false
}: ProductTabsProps) => {
  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => getProductCategories(),
  });

  const { data: attributes } = useQuery({
    queryKey: ["product-attributes"],
    queryFn: () => getProductAttributes(),
  });

  const { data: attributeTerms, isLoading: loadingTerms } = useQuery({
    queryKey: ["all-attribute-terms", attributes?.map(attr => attr.id)],
    queryFn: async () => {
      const results: Record<number, any[]> = {};
      
      if (!attributes || attributes.length === 0) {
        return results;
      }

      for (const attr of attributes) {
        try {
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

  // Debug to check if attributes are being properly passed
  console.log("Selected attributes in ProductTabs:", selectedAttributes);
  console.log("Current variations in ProductTabs:", variations);

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
      <TabsList className="grid grid-cols-4 md:w-[800px]">
        <TabsTrigger value="general">Thông tin cơ bản</TabsTrigger>
        <TabsTrigger value="inventory">Kho hàng</TabsTrigger>
        <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
        <TabsTrigger value="variations">Biến thể</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <GeneralTab 
          form={form} 
          categories={categories} 
          imagePreviewUrls={imagePreviewUrls}
          setImagePreviewUrls={setImagePreviewUrls}
          setSelectedImages={setSelectedImages}
          productType={productType}
          setProductType={setProductType}
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

      <TabsContent value="variations">
        <VariationsTab
          form={form}
          product={product}
          productId={productId}
          productType={productType}
          selectedAttributes={selectedAttributes}
          variations={variations}
          setVariations={setVariations}
          isLoadingVariations={false}
          uploadVariationImage={uploadVariationImage}
          isUploadingImage={isUploadingImage}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProductTabs;
