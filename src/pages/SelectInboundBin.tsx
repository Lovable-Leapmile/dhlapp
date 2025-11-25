import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { BinConfirmationDialog } from "@/components/BinConfirmationDialog";
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

const SelectInboundBin = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "empty">("all");
  const [allBins, setAllBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch bins from API
  useEffect(() => {
    const fetchBins = async () => {
      // Hardcoded values from the provided curl example
      const AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwNzIyMTMyOX0.yl2G3oNWNgXXyCyCLnj8IW0VZ2TezllqSdnhSyLg9NQ";

      try {
        setIsLoading(true);
        console.log("Fetching bins with hardcoded token");
        
        const response = await fetch(
          "https://robotmanagerv1test.qikpod.com/nanostore/trays?tray_status=active&order_by_field=updated_at&order_by_type=ASC",
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${AUTH_TOKEN}`,
            },
          }
        );

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(`Failed to fetch bins: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        
        console.log("API Response:", data);
        
        // Map API response to bin format - the data is in the 'records' property
        let bins: Bin[] = [];
        
        if (data.records && Array.isArray(data.records)) {
          bins = data.records.map((tray: any) => ({
            id: tray.tray_id,
            itemCount: tray.total_item_quantity || 0,
          }));
        } else if (Array.isArray(data)) {
          bins = data.map((tray: any) => ({
            id: tray.tray_id,
            itemCount: tray.total_item_quantity || 0,
          }));
        } else if (data.data && Array.isArray(data.data)) {
          bins = data.data.map((tray: any) => ({
            id: tray.tray_id,
            itemCount: tray.total_item_quantity || 0,
          }));
        } else {
          console.error("Unexpected API response structure:", data);
          throw new Error("Invalid response structure from API");
        }

        console.log("Mapped bins:", bins);
        setAllBins(bins);
      } catch (error) {
        toast.error("Failed to load bins. Please try again.");
        console.error("Error fetching bins:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBins();
  }, []);

  // Filter bins based on search query and filter type
  let bins = allBins.filter(bin => {
    const matchesSearch = searchQuery 
      ? bin.id.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesFilter = filterType === "empty" 
      ? bin.itemCount === 0 
      : true;
    return matchesSearch && matchesFilter;
  });

  const handleBinClick = (bin: Bin) => {
    setSelectedBin(bin);
    setShowConfirmation(true);
  };

  const handleConfirmBinSelection = async (stayTime: number) => {
    if (!selectedBin) return;
    
    setIsProcessing(true);
    
    // Hardcoded values from the provided curl example
    const AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwNzIyMTMyOX0.yl2G3oNWNgXXyCyCLnj8IW0VZ2TezllqSdnhSyLg9NQ";
    const USER_ID = "1"; // From the example response

    try {
      console.log("Creating order with hardcoded credentials:", {
        tray_id: selectedBin.id,
        user_id: USER_ID,
        auto_complete_time: stayTime
      });

      const response = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/orders?tray_id=${selectedBin.id}&user_id=${USER_ID}&auto_complete_time=${stayTime}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`,
          }
        }
      );

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        throw new Error(`Failed to confirm bin selection: ${response.status} - ${JSON.stringify(responseData)}`);
      }

      // Navigate to scan items page with the selected bin
      navigate("/inbound/scan-items", { 
        state: { 
          binId: selectedBin.id,
          orderId: responseData.id // Assuming the API returns an order ID
        } 
      });
    } catch (error) {
      console.error("Error confirming bin selection:", error);
      toast.error("Failed to confirm bin selection. Please check your connection and try again.");
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
            <p className="text-muted-foreground">Loading bins...</p>
          </div>
        ) : (
          <>
            {/* Total Bins */}
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-base sm:text-lg text-muted-foreground">
                {searchQuery ? "Found" : "Total"} Bins: <span className="font-semibold text-foreground">{bins.length}</span>
              </p>
            </div>

            {/* Bins Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {bins.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No bins found</p>
                </div>
              ) : (
                bins.map((bin, index) => (
                  <div
                    key={bin.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <BinCard
                      binId={bin.id}
                      itemCount={bin.itemCount}
                      onClick={() => handleBinClick(bin)}
                      isSelected={selectedBin?.id === bin.id}
                    />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
      
      {selectedBin && (
        <BinConfirmationDialog
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmBinSelection}
          bin={{
            binId: selectedBin.id,
            itemCount: selectedBin.itemCount
          }}
        />
      )}
    </div>
  );
};

export default SelectInboundBin;
