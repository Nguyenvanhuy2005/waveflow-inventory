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
  manage_stock?: boolean;
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
  const attributesForVariation = attributes.filter(attr => attr.variation);
  
  if (attributesForVariation.length === 0) {
    return [];
  }

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
  
  existingVariations.forEach(variation => {
    const signature = variation.attributes
      .map(attr => `${attr.name}:${attr.option}`)
      .sort()
      .join('|');
    existingVariationMap.set(signature, variation);
  });

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
      manage_stock: defaultData.manage_stock || false
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
  salePrice: string
): Variation[] => {
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
        // Generate SKU with format SC+variation_id
        const variationId = variation.id || index;
        variation.sku = `SC${variationId}`;
      });
      break;
      
    default:
      break;
  }
  
  return updatedVariations;
};
