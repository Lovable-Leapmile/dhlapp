import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, ArrowLeft, PackageOpen, X } from "lucide-react";

interface Bin {
  id: number;
  created_at: string;
  updated_at: string;
  status: string | null;
  tray_id: string;
  tray_status: string;
  tray_lockcount: number;
  tray_height: number;
  tags: string | null;
  tray_weight: number;
  tray_divider: number;
  total_item_quantity: number;
}

interface BinItem {
  id: number;
  created_at: string;
  updated_at: string;
  status: string | null;
  tray_id: string;
  tray_status: string;
  tray_lockcount: number;
  tray_height: number;
  tags: string | null;
  tray_weight: number;
  tray_divider: number;
  available_quantity: number;
  inbound_date: string;
  item_id: string;
  item_description: string;
}

const AdminBins = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const [bins, setBins] = useState<Bin[]>([]);
  const [filteredBins, setFilteredBins] = useState<Bin[]>([]);
  const [binItems, setBinItems] = useState<BinItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [showBinDetails, setShowBinDetails] = useState(false);
  const [error, setError] = useState("");

  const authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwNzIyMTMyOX0.yl2G3oNWNgXXyCyCLnj8IW0VZ2TezllqSdnhSyLg9NQ";

  const fetchBins = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      console.log("Fetching bins from API...");
      const response = await fetch('https://robotmanagerv1test.qikpod.com/nanostore/trays?order_by_field=updated_at&order_by_type=ASC', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log("Bins API Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Bins API Response Data:", data);
      console.log("Data type:", typeof data);
      console.log("Is array?", Array.isArray(data));
      
      // Handle different API response structures
      let bins = [];
      if (data && typeof data === 'object') {
        // Check for records array (like bin items API)
        if (data.records && Array.isArray(data.records)) {
          bins = data.records;
        } 
        // Check if data is directly an array
        else if (Array.isArray(data)) {
          bins = data;
        }
        // Try to find array in object values
        else {
          const possibleArrays = Object.values(data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            console.log("Found array in response:", possibleArrays[0]);
            bins = possibleArrays[0];
          }
        }
      } else if (Array.isArray(data)) {
        bins = data;
      }
      
      // Filter out dummy bins (Tray1, Tray2, etc.) and keep only real bins (TRAY-1, TRAY-2, etc.)
      const realBins = bins.filter((bin: any) => 
        bin.tray_id && (bin.tray_id.startsWith('TRAY-') || bin.tray_id.startsWith('Tray-'))
      );
      
      console.log("All bins from API:", bins);
      console.log("Filtered real bins:", realBins);
      console.log("Number of real bins:", realBins.length);
      realBins.forEach((bin: any, index: number) => {
        console.log(`Real Bin ${index}:`, bin);
      });
      
      setBins(realBins);
      setFilteredBins(realBins);
    } catch (error) {
      console.error('Error fetching bins:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch bins');
      // Set empty array on error to show "No Bins Found" instead of mock data
      setBins([]);
      setFilteredBins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBinItems = async (binId: string) => {
    try {
      setIsLoadingItems(true);
      
      console.log("Fetching bin items for:", binId);
      const response = await fetch(`https://robotmanagerv1test.qikpod.com/nanostore/trays_for_order?tray_id=${binId}&return_item=true&num_records=100&offset=0&order_flow=fifo`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log("Bin Items API Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Bin Items API Response Data:", data);
      
      // Handle the new API response structure
      let items = [];
      if (data && typeof data === 'object') {
        if (data.records && Array.isArray(data.records)) {
          items = data.records;
        } else if (Array.isArray(data)) {
          items = data;
        }
      }
      
      setBinItems(items);
    } catch (error) {
      console.error('Error fetching bin items:', error);
      // Set empty array on error to show "No Items Found"
      setBinItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, []);

  useEffect(() => {
    const filtered = bins.filter(bin =>
      bin.tray_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.tray_status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBins(filtered);
  }, [searchTerm, bins]);

  const handleBinSelect = (bin: Bin) => {
    setSelectedBin(bin);
    setShowBinDetails(true);
    fetchBinItems(bin.tray_id);
  };

  const handleBackToBins = () => {
    setShowBinDetails(false);
    setSelectedBin(null);
    setBinItems([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pt-[140px]">
      <AppBar title="Bins" showBack username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-4">
          {!showBinDetails ? (
            /* Bin List View */
            <div className="space-y-4">
              {/* Search Bar and Stats */}
              <div className="flex justify-center items-center gap-3 mb-6 sm:mb-8">
                <div className={`transition-all duration-300 ${
                  isSearchExpanded ? 'w-full max-w-md' : 'w-auto'
                }`}>
                  {!isSearchExpanded ? (
                    <Button
                      onClick={() => setIsSearchExpanded(true)}
                      variant="outline"
                      className="h-12 sm:h-14 w-12 sm:w-14 p-0 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 shadow-sm"
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search bin ID..."
                        className="h-12 sm:h-14 pl-10 pr-10 text-base"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setIsSearchExpanded(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Total Bins - Centered */}
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-base sm:text-lg text-muted-foreground">
                  {searchTerm ? "Found" : "Total"} Bins: <span className="font-semibold text-foreground">{filteredBins.length > 0 ? filteredBins.length : bins.length}</span>
                </p>
              </div>

              {/* Bins Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-lg text-muted-foreground">Loading bins...</p>
                  </div>
                </div>
              ) : filteredBins.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
                    {filteredBins.map((bin) => (
                      <div
                        key={bin.id}
                        onClick={() => handleBinSelect(bin)}
                        className="cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <BinCard binId={bin.tray_id} itemCount={bin.total_item_quantity} />
                      </div>
                    ))}
                  </div>
                </>
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
                    {searchTerm ? 'No bins match your search criteria.' : 'No bins available in the system.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Bin Details View */
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="outline"
                onClick={handleBackToBins}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bins
              </Button>

              {/* Selected Bin Header */}
              <div className="w-full">
                <BinCard binId={selectedBin?.tray_id || ""} itemCount={selectedBin?.total_item_quantity || 0} />
              </div>

              {/* Bin Items Header */}
              <div className="flex items-center justify-center gap-2">
                <PackageOpen className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center">
                  Bin Items Details
                </h2>
              </div>

              {/* Bin Items List */}
              {isLoadingItems ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-lg text-muted-foreground">Loading bin items...</p>
                  </div>
                </div>
              ) : binItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {binItems.map((item) => (
                    <Card key={item.id} className="p-6 bg-card border-border">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <PackageOpen className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-lg font-semibold text-foreground">{item.item_description}</h3>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Item ID: <span className="font-medium text-foreground">{item.item_id}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: <span className="font-medium text-foreground">{item.available_quantity}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Created at: <span className="font-medium text-foreground">{formatDate(item.created_at)}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Last Used at: <span className="font-medium text-foreground">{formatDate(item.updated_at)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <PackageOpen className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <PackageOpen className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-foreground">
                      No Items Found
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    No items found in this bin.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminBins;
