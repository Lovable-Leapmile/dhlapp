import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const SelectInboundBin = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - 50 bins
  const allBins = Array.from({ length: 50 }, (_, i) => ({
    id: `DR1F${String(i + 1).padStart(2, "0")}`,
    itemCount: Math.floor(Math.random() * 10) + 1,
  }));

  // Filter bins based on search query
  const bins = searchQuery
    ? allBins.filter((bin) =>
        bin.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allBins;

  const handleBinClick = (binId: string) => {
    setSelectedBin(binId);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (selectedBin) {
      navigate("/inbound/scan-items", { state: { binId: selectedBin } });
    }
  };

  const handleSearch = () => {
    setShowSearch(true);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const foundBin = allBins.find(
        (bin) => bin.id.toLowerCase() === searchQuery.toLowerCase()
      );
      if (foundBin) {
        setShowSearch(false);
        setSearchQuery("");
        handleBinClick(foundBin.id);
      } else {
        toast({
          title: "Bin not found",
          description: `No bin found with ID: ${searchQuery}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Select Inbound Bin" showBack username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Button */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <Button
            onClick={handleSearch}
            variant="outline"
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-accent/30 hover:border-accent hover:bg-accent/10 transition-smooth"
          >
            <Search className="mr-2 h-5 w-5 text-destructive" />
            Search by Bin ID
          </Button>
        </div>

        {/* Search Filter Display */}
        {searchQuery && (
          <div className="flex justify-center mb-4">
            <div className="bg-accent/20 px-4 py-2 rounded-full flex items-center gap-2">
              <p className="text-sm text-foreground">
                Filtering: <span className="font-semibold">{searchQuery}</span>
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="h-6 w-6 rounded-full hover:bg-destructive/10"
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        )}

        {/* Total Bins */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-base sm:text-lg text-muted-foreground">
            {searchQuery ? "Found" : "Total"} Bins: <span className="font-semibold text-foreground">{bins.length}</span>
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

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search Bin by ID</DialogTitle>
            <DialogDescription>
              Enter the bin ID to search and select
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter Bin ID (e.g., DR1F01)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              className="text-base"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSearchSubmit}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
