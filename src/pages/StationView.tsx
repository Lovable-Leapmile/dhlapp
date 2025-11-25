import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, PackageCheck, PackageSearch, AlertCircle, ArrowRight } from "lucide-react";

interface StationOrder {
  id: string;
  tray_id: string;
  station_friendly_name: string;
  tray_status: string;
  updated_at: string;
}

const StationView = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const [pendingOrder, setPendingOrder] = useState<StationOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOrderTypeDialog, setShowOrderTypeDialog] = useState(false);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [shouldStopPolling, setShouldStopPolling] = useState(false);

  useEffect(() => {
    if (shouldStopPolling) return;

    const pollInterval = setInterval(() => {
      fetchPendingOrders();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [shouldStopPolling]);

  const fetchPendingOrders = async () => {
    const authToken = sessionStorage.getItem("authToken");
    
    if (!authToken) {
      console.error("No auth token found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/orders?tray_status=tray_ready_to_use&order_by_field=updated_at&order_by_type=ASC`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Station orders response:", data);
        
        if (data.records && data.records.length > 0) {
          // Get the most recent pending order
          const latestOrder = data.records[0];
          setPendingOrder(latestOrder);
          setIsLoading(false);
        } else {
          // No pending orders found
          setPendingOrder(null);
          setIsLoading(false);
        }
      } else {
        // API failed - show station as clear and stop polling
        console.log("API failed, showing station as clear");
        setPendingOrder(null);
        setIsLoading(false);
        setShouldStopPolling(true);
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      // Error occurred - show station as clear and stop polling
      setPendingOrder(null);
      setIsLoading(false);
      setShouldStopPolling(true);
    }
  };

  const handleContinueOrder = () => {
    setShowOrderTypeDialog(true);
  };

  const handleOrderTypeSelect = (type: 'inbound' | 'pickup') => {
    if (!pendingOrder) return;
    
    // Store order info in session for scan items page
    sessionStorage.setItem("currentOrderId", pendingOrder.id);
    sessionStorage.setItem("currentTrayId", pendingOrder.tray_id);
    sessionStorage.setItem("currentUserId", sessionStorage.getItem("userId") || "");
    
    // Navigate to appropriate scan items page
    if (type === 'inbound') {
      navigate("/inbound/scan-items", { 
        state: { 
          binId: pendingOrder.tray_id, 
          orderId: pendingOrder.id 
        } 
      });
    } else {
      navigate("/pickup/scan-items", { 
        state: { 
          binId: pendingOrder.tray_id, 
          orderId: pendingOrder.id 
        } 
      });
    }
  };

  const handleReleaseTray = async () => {
    if (!pendingOrder) return;
    
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) return;

    setIsReleasing(true);
    
    try {
      const response = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/orders/${pendingOrder.id}/complete`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        console.log("Order completed successfully");
        setShowReleaseConfirm(false);
        // Restart polling to check for new orders
        setShouldStopPolling(false);
        setIsLoading(true);
        setPendingOrder(null);
        // The polling interval will automatically call fetchPendingOrders again
      } else {
        console.error("Failed to complete order:", response.status);
      }
    } catch (error) {
      console.error("Error completing order:", error);
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Station View" showBack username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-pulse text-center">
                <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">Checking station status...</p>
              </div>
            </div>
          ) : pendingOrder ? (
            <div className="space-y-8">
              {/* Station Status Card */}
              <Card className="p-8 sm:p-12 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
                <div className="text-center space-y-6">
                  {/* Alert Icon */}
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-10 w-10 text-amber-600" />
                  </div>
                  
                  {/* Status Message */}
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-amber-800">
                      Pending Order at Station
                    </h2>
                    <p className="text-amber-700">
                      A tray is waiting at the station for processing
                    </p>
                  </div>

                  {/* Station and Tray Info */}
                  <div className="bg-white/70 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-medium text-amber-600 mb-1">Station</p>
                        <p className="text-xl font-semibold text-amber-900">
                          {pendingOrder.station_friendly_name || 'Main Station'}
                        </p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-medium text-amber-600 mb-1">Tray ID</p>
                        <p className="text-xl font-semibold text-amber-900">
                          {pendingOrder.tray_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleContinueOrder}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                    >
                      Continue Order
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => setShowReleaseConfirm(true)}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 px-8 py-3 text-lg"
                    >
                      Release Tray
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            /* No Pending Orders */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <PackageCheck className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Station is Clear
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                No pending orders at the station. The station is ready for new operations.
              </p>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3"
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Order Type Selection Dialog */}
      <AlertDialog open={showOrderTypeDialog} onOpenChange={setShowOrderTypeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Select Order Type</AlertDialogTitle>
            <AlertDialogDescription>
              Choose the type of operation you want to continue with for tray {pendingOrder?.tray_id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              onClick={() => handleOrderTypeSelect('inbound')}
              className="flex flex-col items-center gap-3 h-24 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              variant="outline"
            >
              <PackageCheck className="h-8 w-8" />
              <span className="font-medium">Inbound</span>
            </Button>
            <Button
              onClick={() => handleOrderTypeSelect('pickup')}
              className="flex flex-col items-center gap-3 h-24 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
              variant="outline"
            >
              <PackageSearch className="h-8 w-8" />
              <span className="font-medium">Pickup</span>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Release Tray Confirmation Dialog */}
      <AlertDialog open={showReleaseConfirm} onOpenChange={setShowReleaseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Tray</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to release tray {pendingOrder?.tray_id} from {pendingOrder?.station_friendly_name || 'the station'}? 
              This will complete the current order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReleasing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReleaseTray}
              disabled={isReleasing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isReleasing ? "Releasing..." : "Release Tray"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default StationView;
