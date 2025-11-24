import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

interface Bin {
  id: string;
  itemCount: number;
}

const SelectPickupBin = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "empty">("all");
  const [allBins, setAllBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bins from API
  useEffect(() => {
    const fetchBins = async () => {
      const authToken = sessionStorage.getItem("authToken");
      
      if (!authToken) {
        toast.error("Authentication token not found. Please login again.");
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          "https://robotmanagerv1test.qikpod.com/nanostore/trays?tray_status=active&order_by_field=updated_at&order_by_type=DESC",
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bins");
        }

        const data = await response.json();
        
        // Map API response to bin format
        const bins: Bin[] = data.data.map((tray: any) => ({
          id: tray.tray_id,
          itemCount: tray.total_item_quantity || 0,
        }));

        setAllBins(bins);
      } catch (error) {
        toast.error("Failed to load bins. Please try again.");
        console.error("Error fetching bins:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBins();
  }, [navigate]);

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
      navigate("/pickup/scan-items", { state: { binId: selectedBin } });
    }
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchQuery("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Select Pickup Bin" showBack username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar and Filter */}
        <div className="flex justify-center items-center gap-3 mb-6 sm:mb-8">
          <div className={`transition-all duration-300 ${
            isSearchExpanded ? 'w-full max-w-md' : 'w-auto'
          }`}>
            {!isSearchExpanded ? (
              <Button
                onClick={toggleSearch}
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
                  onClick={toggleSearch}
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
            <p className="text-muted-foreground">Loading bins...</p>
          </div>
        ) : (
          <>
            {/* Total Bins */}
            <div className="mb-6 sm:mb-8">
              <p className="text-center text-base sm:text-lg text-muted-foreground">
                {bins.length} bins available
              </p>
            </div>

            {/* Bins Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-6">
              {bins.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No bins found</p>
                </div>
              ) : (
                bins.map((bin, index) => (
                  <div
                    key={bin.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <BinCard
                      binId={bin.id}
                      itemCount={bin.itemCount}
                      onClick={() => handleBinClick(bin.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bin Selection</AlertDialogTitle>
            <AlertDialogDescription>
              You have selected <strong>{selectedBin}</strong> for pickup. Do you want to
              proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedBin(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SelectPickupBin;
