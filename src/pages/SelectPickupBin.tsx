import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X, Filter, Loader2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
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
  const [trayStayTime, setTrayStayTime] = useState(2);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "empty">("all");
  const [allBins, setAllBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleConfirm = async () => {
    if (!selectedBin) return;
    
    const authToken = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");
    
    if (!authToken || !userId) {
      toast.error("Authentication required. Please login again.");
      navigate("/");
      return;
    }

    setIsCreatingOrder(true);
    
    try {
      const response = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/orders?tray_id=${selectedBin}&user_id=${userId}&auto_complete_time=${trayStayTime}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Order creation error:", errorText);
        throw new Error(`Failed to create order: ${response.status}`);
      }

      const orderData = await response.json();
      
      // Store order info in session for scan items page
      sessionStorage.setItem("currentOrderId", orderData.id?.toString() || "");
      sessionStorage.setItem("currentTrayId", selectedBin);
      sessionStorage.setItem("currentUserId", userId);
      sessionStorage.setItem("trayStayTime", trayStayTime.toString());
      
      toast.success("Order created successfully!");
      navigate("/pickup/scan-items", { state: { binId: selectedBin, orderId: orderData.id } });
    } catch (error) {
      toast.error("Failed to create order. Please try again.");
      console.error("Error creating order:", error);
    } finally {
      setIsCreatingOrder(false);
      setShowConfirm(false);
    }
  };

  const handleTimeChange = (value: number) => {
    if (value >= 1 && value <= 60) {
      setTrayStayTime(value);
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
        <AlertDialogContent className="max-w-md w-full">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-center">Confirm Bin Selection</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-full max-w-none">
                  <BinCard binId={selectedBin || ""} itemCount={0} onClick={() => {}} />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-center block">
                  Enter tray stay time at station (in minutes)
                </Label>
                
                {/* Arrow Number Picker */}
                <div className="flex items-center justify-center gap-4 py-4">
                  {/* Left Arrow */}
                  <button
                    onClick={() => handleTimeChange(trayStayTime - 1)}
                    disabled={trayStayTime <= 1}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  {/* Number Display with Time Icon and Min Label */}
                  <div className="flex flex-col items-center justify-center">
                    {/* Time Icon */}
                    <Clock className="h-6 w-6 text-accent mb-1" />
                    
                    {/* Number Display */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <div className="text-5xl font-bold text-accent">
                        {trayStayTime}
                      </div>
                    </div>
                    
                    {/* Min Label */}
                    <div className="mt-0 px-3 py-1 bg-accent text-white rounded-full text-sm font-medium">
                      min
                    </div>
                  </div>
                  
                  {/* Right Arrow */}
                  <button
                    onClick={() => handleTimeChange(trayStayTime + 1)}
                    disabled={trayStayTime >= 60}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={() => setSelectedBin(null)} 
              disabled={isCreatingOrder}
              className="flex-1 h-11"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="flex-1 h-11 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? "Creating Order..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SelectPickupBin;
