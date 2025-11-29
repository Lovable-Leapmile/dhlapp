import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { BinCard } from "@/components/BinCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bin1 from "@/assets/bin1.png";
import { Search, X, Filter, Loader2, Package, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/utils/api";
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
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [trayStayTime, setTrayStayTime] = useState(2);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
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
          getApiUrl(`/nanostore/trays?tray_status=active&order_by_field=updated_at&order_by_type=DESC`),
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

  const handleBinClick = (bin: Bin) => {
    setSelectedBin(bin);
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
        getApiUrl(`/nanostore/orders?tray_id=${selectedBin.id}&user_id=${userId}&auto_complete_time=${trayStayTime}`),
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
      sessionStorage.setItem("currentTrayId", selectedBin.id);
      sessionStorage.setItem("currentUserId", userId);
      sessionStorage.setItem("trayStayTime", trayStayTime.toString());
      
      toast.success("Order created successfully!");
      navigate("/pickup/scan-items", { state: { binId: selectedBin.id, orderId: orderData.id } });
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

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background pt-[140px]">
      <AppBar title="Select Pickup Bin" showBack username={username} />

      {/* Fixed White Div with Search and Stats */}
      <div className="fixed top-[142px] left-0 right-0 bg-white border-b border-gray-200 z-40 shadow-sm -mt-[6px]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bin ID..."
                  className="h-9 sm:h-12 pl-8 sm:pl-10 pr-8 sm:pr-10 text-sm sm:text-base w-full"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>
              
              {/* Filter Button */}
              <Button
                variant={filterType === "empty" ? "default" : "outline"}
                onClick={() => setFilterType(filterType === "all" ? "empty" : "all")}
                className="h-9 sm:h-12 px-3 sm:px-6 text-sm sm:text-base bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 shadow-sm flex-shrink-0"
              >
                <Filter className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">{filterType === "all" ? "All" : "Empty"}</span>
                <span className="sm:hidden">{filterType === "all" ? "A" : "E"}</span>
              </Button>
              
              {/* Total Bins Label */}
              <div className="text-sm sm:text-lg font-medium text-foreground whitespace-nowrap">
                Total Bins: <span className="text-red-600">{bins.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Bins List */}
      <div className="pt-[4.5rem]">
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-lg text-muted-foreground">Loading bins...</p>
                </div>
              </div>
            ) : bins.length > 0 ? (
              <div className="flex flex-wrap gap-2 sm:gap-6 justify-center">
                {bins.map((bin, index) => (
                  <div
                    key={bin.id}
                    className="animate-fade-in cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] w-[calc(50%-0.5rem)] sm:w-[180px] md:w-[220px] lg:w-[240px] xl:w-[240px]"
                    style={{ animationDelay: `${index * 20}ms` }}
                    onClick={() => handleBinClick(bin)}
                  >
                    <BinCard
                      binId={bin.id}
                      itemCount={bin.itemCount}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Package className="h-10 w-10 text-gray-600" />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Package className="h-8 w-8 text-gray-600" />
                  <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                    No Bins Found
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  {searchQuery ? 'No bins match your search criteria.' : 'No bins available in the system.'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-md l-4 r-4 sm:mx-0 sm:l-0 sm:r-0 max-w-[calc(100vw-2rem)] sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-center">Confirm Bin Selection</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-center">
              <div className="px-4">
                <div className="w-full">
                  <div className="w-full [&>div]:!w-full">
                    <BinCard binId={selectedBin?.id || ""} itemCount={selectedBin?.itemCount || 0} onClick={() => {}} />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-center block flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Enter tray stay time at station (in minutes)
                </Label>
                
                {/* Arrow Number Picker */}
                <div className="flex items-center justify-center gap-4 py-2">
                  {/* Left Arrow */}
                  <button
                    onClick={() => handleTimeChange(trayStayTime - 1)}
                    disabled={trayStayTime <= 1}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  {/* Number Display with Min Label */}
                  <div className="flex items-center justify-center gap-2">
                    {/* Number Display */}
                    <div className="text-5xl font-bold text-accent">
                      {trayStayTime}
                    </div>
                    
                    {/* Min Label */}
                    <span className="text-lg font-medium text-accent">
                      min
                    </span>
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
