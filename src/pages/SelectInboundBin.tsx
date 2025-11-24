import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
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

const SelectInboundBin = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Mock data - 50 bins
  const bins = Array.from({ length: 50 }, (_, i) => ({
    id: `DR1F${String(i + 1).padStart(2, "0")}`,
    itemCount: Math.floor(Math.random() * 10) + 1,
  }));

  const handleBinClick = (binId: string) => {
    setSelectedBin(binId);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (selectedBin) {
      navigate("/inbound/scan-items", { state: { binId: selectedBin } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Select Inbound Bin" showBack username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Button */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <Button
            variant="outline"
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-border hover:border-accent hover:bg-accent/10 transition-smooth"
          >
            <Search className="mr-2 h-5 w-5" />
            Search by Bin ID
          </Button>
        </div>

        {/* Total Bins */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-base sm:text-lg text-muted-foreground">
            Total Bins: <span className="font-semibold text-foreground">{bins.length}</span>
          </p>
        </div>

        {/* Bins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {bins.map((bin, index) => (
            <div
              key={bin.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 20}ms` }}
            >
              <BinCard
                binId={bin.id}
                itemCount={bin.itemCount}
                onClick={() => handleBinClick(bin.id)}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bin Selection</AlertDialogTitle>
            <AlertDialogDescription>
              You have selected bin <span className="font-semibold">{selectedBin}</span>. Do you
              want to proceed with scanning items for this bin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SelectInboundBin;
