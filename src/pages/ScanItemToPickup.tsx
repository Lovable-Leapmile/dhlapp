import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Barcode } from "lucide-react";
import { toast } from "sonner";
import robotAnimation from "@/assets/robot-bin-animation.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const VALID_ITEMS = ["item1", "item2", "item3", "item4", "item5"];

const ScanItemToPickup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const binId = location.state?.binId || "Unknown";

  const [isLoading, setIsLoading] = useState(true);
  const [scannedItem, setScannedItem] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  useEffect(() => {
    // Simulate robot retrieving bin
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleScan = (value: string) => {
    if (value.trim() === "") return;

    if (VALID_ITEMS.includes(value.toLowerCase())) {
      setItems((prev) => [...prev, value]);
      setScannedItem("");
      toast.success("Item picked successfully", {
        duration: 2000,
      });
    } else {
      setScannedItem("");
      toast.error("Item didn't picked, invalid item", {
        duration: 2000,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleScan(scannedItem);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.info("Item removed");
  };

  const handleCompleteOrder = () => {
    if (items.length === 0) {
      toast.error("Please scan at least one item");
      return;
    }
    toast.success("Pickup completed successfully!");
    navigate("/pickup/select-bin");
  };

  const handleBack = () => {
    if (items.length > 0) {
      setShowBackConfirm(true);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Scan Item to Pickup" showBack username={username} onBack={handleBack} />

      {isLoading ? (
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center justify-center">
          <div className="text-center space-y-6 animate-fade-in">
            <img
              src={robotAnimation}
              alt="Robot retrieving bin"
              className="w-full max-w-2xl mx-auto rounded-lg animate-pulse"
            />
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Retrieving Bin {binId}
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground">
                Robot is delivering the bin to the picking station...
              </p>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Selected Bin */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">
                Selected Bin
              </h3>
              <BinCard binId={binId} itemCount={3} />
            </div>

            {/* Scan Input */}
            <div className="space-y-2">
              <Label htmlFor="scan-input" className="text-base sm:text-lg">
                Scanned Item
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Barcode className="h-5 w-5 sm:h-6 sm:w-6 text-accent animate-scan-pulse" />
                </div>
                <Input
                  id="scan-input"
                  type="text"
                  value={scannedItem}
                  onChange={(e) => setScannedItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scan or enter item ID"
                  className="h-12 sm:h-14 pl-12 sm:pl-14 text-base sm:text-lg bg-background border-border focus:border-accent focus:ring-accent"
                  autoFocus
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Valid items: item1, item2, item3, item4, item5
              </p>
            </div>

            {/* Scanned Items List */}
            {items.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-medium text-foreground">
                  Picked Items ({items.length})
                </h3>
                <div className="space-y-3 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
                  {items.map((item, index) => (
                    <ItemCard key={`${item}-${index}`} itemId={item} onRemove={() => handleRemoveItem(index)} />
                  ))}
                </div>
              </div>
            )}

            {/* Complete Button */}
            <div className="sticky bottom-0 pt-4 pb-2 bg-background">
              <Button
                onClick={handleCompleteOrder}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-smooth"
              >
                Complete Pickup
              </Button>
            </div>
          </div>
        </main>
      )}

      <Footer />

      {/* Back Confirmation Dialog */}
      <AlertDialog open={showBackConfirm} onOpenChange={setShowBackConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Scanning?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {items.length} picked item(s). Are you sure you want to go back? Your
              progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate(-1)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScanItemToPickup;
