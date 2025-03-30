
import { AlertCircle, Grid } from "lucide-react";

interface NoVariationsStateProps {
  hasVariationAttributes: boolean;
}

const NoVariationsState = ({ hasVariationAttributes }: NoVariationsStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
      {hasVariationAttributes ? (
        <>
          <Grid className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">Chưa có biến thể nào</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Nhấn "Tạo biến thể" để tạo tất cả các biến thể có thể từ thuộc tính đã chọn.
          </p>
        </>
      ) : (
        <>
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">Cần chọn thuộc tính</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Vui lòng chọn ít nhất một thuộc tính trong tab Thuộc tính và đánh dấu
            "Dùng cho biến thể" để có thể tạo biến thể cho sản phẩm này.
          </p>
        </>
      )}
    </div>
  );
};

export default NoVariationsState;
