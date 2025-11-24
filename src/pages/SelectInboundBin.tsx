import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Filter } from "lucide-react";
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "empty">("all");

  // Mock data - 50 bins with some empty ones
  const allBins = Array.from({ length: 50 }, (_, i) => ({
    id: `DR1F${String(i + 1).padStart(2, "0")}`,
    itemCount: i % 5 === 0 ? 0 : Math.floor(Math.random() * 10) + 1,
  }));

  // Filter bins based on search query and filter type
  let bins = searchQuery
    ? allBins.filter((bin) =>
        bin.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allBins;

  // Apply empty filter
  if (filterType === "empty") {
    bins = bins.filter((bin) => bin.itemCount === 0);
  }

  const handleBinClick = (binId: string) => {
    setSelectedBin(binId);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (selectedBin) {
      navigate("/inbound/scan-items", { state: { binId: selectedBin } });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchExpanded(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Select Inbound Bin" showBack username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar and Filter */}
        <div className="flex justify-center items-center gap-3 mb-6 sm:mb-8">
          <div className={`transition-all duration-300 ${
            isSearchExpanded ? 'w-full max-w-md' : 'w-auto'
          }`}>
            {!isSearchExpanded ? (
              <Button
                onClick={() => setIsSearchExpanded(true)}
                variant="outline"
                className="h-12 sm:h-14 w-12 sm:w-14 p-0"
              >
                <Search className="h-5 w-5" />
              </Button>
            ) : (
              <div className="relative w-full">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bin ID..."
                  className="h-12 sm:h-14 pl-10 pr-10 text-base"
                  autoFocus
                />
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          
          {/* Filter Button */}
          <Button
            variant={filterType === "empty" ? "default" : "outline"}
            onClick={() => setFilterType(filterType === "all" ? "empty" : "all")}
            className="h-12 sm:h-14 px-4 sm:px-6"
          >
            <Filter className="mr-2 h-5 w-5" />
            {filterType === "all" ? "All" : "Empty"}
          </Button>
        </div>

        {/* Total Bins */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-base sm:text-lg text-muted-foreground">
            {searchQuery ? "Found" : "Total"} Bins: <span className="font-semibold text-foreground">{bins.length}</span>
          </p>
        </div>

        {/* Bins Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
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
