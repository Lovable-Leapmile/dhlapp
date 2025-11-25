import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { BinConfirmationDialog } from "@/components/BinConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Bin {
  id: string;
  itemCount: number;
}

const SelectPickupBin = () => {
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
      const authToken = sessionStorage.getItem("authToken");
      
      if (!authToken) {
        toast.error("Authentication token not found. Please login again.");
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        console.log("Fetching bins with token:", authToken);
        
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
  }, [navigate]);

  // Filter bins based on search query and filter type
  const filteredBins = allBins.filter(bin => {
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
      navigate("/pickup/scan-items", { 
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

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchQuery("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Select Bin for Pickup" showBack username={username} />

      <main className="flex-1 p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search bins..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All Bins
                </Button>
                <Button
                  variant={filterType === "empty" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("empty")}
                >
                  Empty Bins
                </Button>
              </div>
            </div>

            {/* Bins Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBins.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No bins found</p>
                </div>
              ) : (
                filteredBins.map((bin, index) => (
                  <div
                    key={bin.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
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

export default SelectPickupBin;
