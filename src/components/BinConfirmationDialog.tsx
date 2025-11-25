3
SelectInboundBin.tsx:140 Missing auth token or user ID
handleConfirmBinSelection	@	SelectInboundBin.tsx:140
handleConfirm	@	BinConfirmationDialog.tsx:41
import { useState } from "react";
import { BinCard } from "./BinCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface BinConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (stayTime: number) => Promise<void>;
  bin: {
    binId: string;
    itemCount: number;
  };
}

export function BinConfirmationDialog({ isOpen, onClose, onConfirm, bin }: BinConfirmationDialogProps) {
  const [stayTime, setStayTime] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (stayTime < 1) {
      setError("Stay time must be at least 1 minute");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onConfirm(stayTime);
      // If onConfirm doesn't throw, the operation was successful
    } catch (err) {
      console.error("Error in confirmation:", err);
      setError("Failed to process your request. Please try again.");
      // Don't close the dialog on error
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Bin Selection</DialogTitle>
          <DialogDescription>
            Please confirm the selected bin and set the tray stay time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex justify-center">
            <BinCard binId={bin.binId} itemCount={bin.itemCount} isSelected={true} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stayTime">Tray stay time at station (in minutes)</Label>
            <Input
              id="stayTime"
              type="number"
              min="1"
              value={stayTime}
              onChange={(e) => {
                setStayTime(Number(e.target.value));
                setError(null); // Clear error when user types
              }}
              className="w-full"
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
