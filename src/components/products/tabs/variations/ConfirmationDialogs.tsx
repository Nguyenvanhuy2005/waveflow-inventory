
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogsProps {
  isConfirmDialogOpen: boolean;
  setIsConfirmDialogOpen: (isOpen: boolean) => void;
  isDeleteVariationDialogOpen: boolean;
  setIsDeleteVariationDialogOpen: (isOpen: boolean) => void;
  onClearAllVariations: () => void;
  onDeleteVariation: () => void;
}

const ConfirmationDialogs = ({
  isConfirmDialogOpen,
  setIsConfirmDialogOpen,
  isDeleteVariationDialogOpen,
  setIsDeleteVariationDialogOpen,
  onClearAllVariations,
  onDeleteVariation
}: ConfirmationDialogsProps) => {
  return (
    <>
      {/* Confirmation Dialog for clearing variations */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tất cả biến thể?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa tất cả biến thể hiện tại. Bạn có chắc chắn muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={onClearAllVariations} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for deleting a single variation */}
      <AlertDialog open={isDeleteVariationDialogOpen} onOpenChange={setIsDeleteVariationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa biến thể?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa biến thể này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteVariation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfirmationDialogs;
