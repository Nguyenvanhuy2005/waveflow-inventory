
import { CellContext } from "@tanstack/react-table";

/**
 * Helper function to safely access row properties in Tanstack Table cell components
 * This resolves TypeScript issues with accessing properties on row.original
 */
export function getCellContent<T extends object, V>(
  props: CellContext<T, V>,
  key: string
): any {
  if (props.row && props.row.original) {
    const original = props.row.original as Record<string, any>;
    return original[key];
  }
  return undefined;
}

/**
 * Helper to safely get nested properties from row objects
 */
export function getNestedCellContent<T extends object, V>(
  props: CellContext<T, V>,
  path: string[]
): any {
  if (!props.row || !props.row.original) return undefined;
  
  let value: any = props.row.original as Record<string, any>;
  
  for (const key of path) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
}
