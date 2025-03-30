interface AttributeOption {
  name: string;
  option: string;
}

interface Variation {
  id?: number;
  attributes: AttributeOption[];
  regular_price: string;
  sale_price: string;
  sku: string;
  stock_quantity?: number;
  stock_status?: string;
  manage_stock?: boolean;
  image?: {
    id?: number;
    src?: string;
  };
}

interface VariationAttribute {
  id: number;
  name: string;
  variation: boolean;
  options: string[];
  [key: string]: any;
}

/**
 * Generate all possible variations from selected attributes
 */
export const generateVariationCombinations = (
  attributes: VariationAttribute[]
): AttributeOption[][] => {
  // Filter attributes marked for variations
  const attributesForVariation = attributes.filter(attr => attr.variation === true);
  
  if (attributesForVariation.length === 0) {
    console.log("No attributes marked for variations");
    return [];
  }

  console.log("Generating variations for attributes:", attributesForVariation);
  const combinations: AttributeOption[][] = [];
  
  // This function generates all possible combinations recursively
  const generateCombinations = (
    attributes: VariationAttribute[],
    currentIndex: number,
    currentCombination: AttributeOption[],
    result: AttributeOption[][]
  ) => {
    // Base case: if we've processed all attributes, add the current combo to results
    if (currentIndex === attributes.length) {
      result.push([...currentCombination]);
      return;
    }

    const currentAttr = attributes[currentIndex];
    
    // If no options for this attribute, skip
    if (!currentAttr.options || currentAttr.options.length === 0) {
      generateCombinations(attributes, currentIndex + 1, currentCombination, result);
      return;
    }

    // For each option of the current attribute
    for (const option of currentAttr.options) {
      if (!option) continue; // Skip empty options
      
      // Add this attribute-option pair to current combination
      currentCombination.push({
        name: currentAttr.name,
        option: option
      });
      
      // Recursive call for next attribute
      generateCombinations(attributes, currentIndex + 1, currentCombination, result);
      
      // Backtrack: remove last added pair
      currentCombination.pop();
    }
  };

  generateCombinations(attributesForVariation, 0, [], combinations);
  console.log(`Generated ${combinations.length} combinations`);
  return combinations;
};

/**
 * Create variation objects from combinations
 */
export const createVariationsFromCombinations = (
  combinations: AttributeOption[][],
  existingVariations: Variation[],
  defaultData: Partial<Variation>
): Variation[] => {
  // Map existing variations by their attribute combination signature
  const existingVariationMap = new Map<string, Variation>();
  
  if (Array.isArray(existingVariations)) {
    existingVariations.forEach(variation => {
      if (variation && typeof variation === 'object' && variation.attributes && Array.isArray(variation.attributes)) {
        const signature = variation.attributes
          .map(attr => `${attr.name}:${attr.option}`)
          .sort()
          .join('|');
        existingVariationMap.set(signature, variation);
      }
    });
  }

  // Create new variations array with all required combinations
  return combinations.map(combination => {
    // Create signature for this combination
    const signature = combination
      .map(attr => `${attr.name}:${attr.option}`)
      .sort()
      .join('|');
    
    // If this combination already exists in our variations, use that data
    if (existingVariationMap.has(signature)) {
      return existingVariationMap.get(signature)!;
    }
    
    // Otherwise create a new variation
    return {
      attributes: combination,
      regular_price: defaultData.regular_price || '',
      sale_price: defaultData.sale_price || '',
      sku: defaultData.sku || '',
      stock_quantity: defaultData.stock_quantity || 0,
      stock_status: defaultData.stock_status || 'instock',
      manage_stock: defaultData.manage_stock || false,
      image: defaultData.image || undefined
    };
  });
};

/**
 * Apply bulk action to all variations
 */
export const applyBulkActionToVariations = (
  variations: Variation[],
  action: string,
  regularPrice: string,
  salePrice: string,
  stockStatus: string,
  stockQuantity: string
): Variation[] => {
  if (!Array.isArray(variations)) {
    console.error("Invalid variations data:", variations);
    return [];
  }

  const updatedVariations = [...variations];

  switch (action) {
    case "set_regular_price":
      updatedVariations.forEach(variation => {
        variation.regular_price = regularPrice;
      });
      break;
      
    case "set_sale_price":
      updatedVariations.forEach(variation => {
        variation.sale_price = salePrice;
      });
      break;
      
    case "set_sku":
      updatedVariations.forEach((variation, index) => {
        // Generate SKU with format SC+variation_id if exists, otherwise SC+index
        const variationId = variation.id || index + 1;
        variation.sku = `SC${variationId}`;
      });
      break;

    case "set_stock_status":
      updatedVariations.forEach(variation => {
        variation.stock_status = stockStatus;
      });
      break;

    case "set_stock_quantity":
      const quantity = parseInt(stockQuantity, 10);
      if (!isNaN(quantity)) {
        updatedVariations.forEach(variation => {
          variation.manage_stock = true;
          variation.stock_quantity = quantity;
        });
      }
      break;
      
    case "toggle_manage_stock":
      updatedVariations.forEach(variation => {
        variation.manage_stock = true;
      });
      break;
      
    default:
      break;
  }
  
  return updatedVariations;
};

/**
 * Format variation attributes for API submission
 * WooCommerce API expects a specific format for attributes
 */
export const formatVariationAttributesForApi = (variations: Variation[]): any[] => {
  if (!Array.isArray(variations)) {
    console.error("Invalid variations data:", variations);
    return [];
  }

  console.log("Formatting variations for API submission:", variations);

  return variations.map(variation => {
    if (!variation || typeof variation !== 'object') {
      console.error("Invalid variation item:", variation);
      return {};
    }
    
    // Create a new object with all the properties of the original variation
    const formattedVariation: Record<string, any> = {};
    
    // Add basic properties
    if (variation.id) formattedVariation.id = variation.id;
    formattedVariation.regular_price = variation.regular_price || '';
    formattedVariation.sale_price = variation.sale_price || '';
    formattedVariation.sku = variation.sku || '';
    
    if (variation.stock_status) formattedVariation.stock_status = variation.stock_status;
    if (variation.stock_quantity !== undefined) formattedVariation.stock_quantity = variation.stock_quantity;
    if (variation.manage_stock !== undefined) formattedVariation.manage_stock = variation.manage_stock;
    
    // Include image if present
    if (variation.image) {
      formattedVariation.image = variation.image;
    }
    
    // Format attributes correctly for WooCommerce API
    if (variation.attributes && Array.isArray(variation.attributes)) {
      formattedVariation.attributes = variation.attributes.map(attr => ({
        name: attr.name,
        option: attr.option
      }));
      
      console.log("Formatted variation attributes:", formattedVariation.attributes);
    } else {
      console.warn("Missing attributes for variation, adding empty array");
      formattedVariation.attributes = [];
    }
    
    return formattedVariation;
  }).filter(variation => Object.keys(variation).length > 0); // Filter out empty variations
};

/**
 * Update variation image
 */
export const updateVariationImage = (
  variations: Variation[],
  index: number,
  imageData: { id?: number, src?: string }
): Variation[] => {
  if (!Array.isArray(variations)) {
    console.error("Invalid variations data:", variations);
    return [];
  }
  
  const updatedVariations = [...variations];
  if (index >= 0 && index < updatedVariations.length) {
    updatedVariations[index] = {
      ...updatedVariations[index],
      image: imageData
    };
    
    console.log(`Updated image for variation at index ${index}:`, imageData);
  }
  
  return updatedVariations;
};
