import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, X, ArrowRight, Package, PackageCheck, Loader2, PackagePlus, Barcode } from "lucide-react";
import { toast } from "sonner";
import robotAnimation from "@/assets/robot-bin-animation.gif";
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

const VALID_ITEMS = ["item1", "item2", "item3", "item4", "item5"];

const ScanItemToInbound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const binId = location.state?.binId || sessionStorage.getItem("currentTrayId") || "Unknown";
  const orderId = location.state?.orderId || sessionStorage.getItem("currentOrderId") || "";
  const userId = sessionStorage.getItem("currentUserId") || sessionStorage.getItem("userId") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [trayStatus, setTrayStatus] = useState<string>("");
  const [orderRecord, setOrderRecord] = useState<any>(null);
  const [pollingMode, setPollingMode] = useState<'inprogress' | 'ready_to_use' | 'stopped'>('inprogress');
  const [countdown, setCountdown] = useState<number>(0);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [scannedItem, setScannedItem] = useState("");
  const [items, setItems] = useState<{ id: number; item_id: string; transaction_type?: string }[]>([]);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; item_id: string } | null>(null);

  useEffect(() => {
    if (pollingMode === 'stopped') return;

    const checkTrayStatus = async () => {
      const authToken = sessionStorage.getItem("authToken");
      
      if (!authToken || !binId || !userId) {
        console.error("Missing required data for tray status check");
        setIsLoading(false);
        setPollingMode('stopped');
        return;
      }

      try {
        console.log("Checking tray status for:", { binId, userId, mode: pollingMode });
        
        if (pollingMode === 'inprogress') {
          // Check inprogress status
          const response = await fetch(
            `https://robotmanagerv1test.qikpod.com/nanostore/orders?tray_id=${binId}&tray_status=inprogress&user_id=${userId}&order_by_field=updated_at&order_by_type=ASC&num_records=1`,
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
            console.log("Inprogress status response:", data);
            
            if (data.records && data.records.length > 0) {
              const order = data.records[0];
              setOrderRecord(order);
              setTrayStatus(order.tray_status || "");
              
              if (order.tray_status !== "inprogress") {
                // Tray is no longer in progress, switch to ready_to_use polling
                console.log("Tray no longer in progress, switching to ready_to_use polling");
                setPollingMode('ready_to_use');
              }
            } else {
              // No inprogress orders found, switch to ready_to_use polling
              console.log("No inprogress orders found, switching to ready_to_use polling");
              setPollingMode('ready_to_use');
            }
          } else if (response.status === 404) {
            // No orders found, switch to ready_to_use polling
            console.log("No orders found (404), switching to ready_to_use polling");
            setPollingMode('ready_to_use');
          } else {
            // Inprogress API failed, immediately check tray_ready_to_use API
            console.error("Inprogress API failed:", response.status, "immediately checking tray_ready_to_use API");
            
            try {
              const readyResponse = await fetch(
                `https://robotmanagerv1test.qikpod.com/nanostore/orders?tray_id=${binId}&tray_status=tray_ready_to_use&user_id=${userId}&order_by_field=updated_at&order_by_type=ASC&num_records=1`,
                {
                  method: 'GET',
                  headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                  },
                }
              );

              if (readyResponse.ok) {
                const readyData = await readyResponse.json();
                console.log("Tray ready to use response (immediate):", readyData);
                
                // API returned success - show scanning section
                setOrderRecord(readyData.records && readyData.records.length > 0 ? readyData.records[0] : null);
                setTrayStatus("tray_ready_to_use");
                setIsLoading(false);
                setPollingMode('ready_to_use');
              } else {
                // tray_ready_to_use API also failed - switch to ready_to_use polling for retry
                console.log("Tray ready to use API also failed, switching to ready_to_use polling");
                setPollingMode('ready_to_use');
              }
            } catch (readyError) {
              console.error("Error checking tray_ready_to_use immediately:", readyError);
              // Switch to ready_to_use polling for retry
              setPollingMode('ready_to_use');
            }
          }
        } else if (pollingMode === 'ready_to_use') {
          // Check tray_ready_to_use status - continue polling until API failure
          const response = await fetch(
            `https://robotmanagerv1test.qikpod.com/nanostore/orders?tray_id=${binId}&tray_status=tray_ready_to_use&user_id=${userId}&order_by_field=updated_at&order_by_type=ASC&num_records=1`,
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
            console.log("Tray ready to use response:", data);
            
            // API returned success - show scanning section and keep polling
            console.log("API returned success, showing scanning items section but keep polling until failure");
            setOrderRecord(data.records && data.records.length > 0 ? data.records[0] : null);
            setTrayStatus("tray_ready_to_use");
            setIsLoading(false);
            // Don't stop polling - continue to check for failure
          } else {
            // API returned failure - navigate to dashboard
            console.log("API failed, navigating to dashboard");
            setPollingMode('stopped');
            navigate("/dashboard");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking tray status:", error);
        
        if (pollingMode === 'inprogress') {
          // Inprogress check failed, immediately check tray_ready_to_use API
          console.log("Inprogress check error, immediately checking tray_ready_to_use API");
          
          try {
            const readyResponse = await fetch(
              `https://robotmanagerv1test.qikpod.com/nanostore/orders?tray_id=${binId}&tray_status=tray_ready_to_use&user_id=${userId}&order_by_field=updated_at&order_by_type=ASC&num_records=1`,
              {
                method: 'GET',
                headers: {
                  'accept': 'application/json',
                  'Authorization': `Bearer ${authToken}`,
                },
              }
            );

            if (readyResponse.ok) {
              const readyData = await readyResponse.json();
              console.log("Tray ready to use response (immediate from error):", readyData);
              
              // API returned success - show scanning section
              setOrderRecord(readyData.records && readyData.records.length > 0 ? readyData.records[0] : null);
              setTrayStatus("tray_ready_to_use");
              setIsLoading(false);
              setPollingMode('ready_to_use');
            } else {
              // tray_ready_to_use API also failed - switch to ready_to_use polling for retry
              console.log("Tray ready to use API also failed from error, switching to ready_to_use polling");
              setPollingMode('ready_to_use');
            }
          } catch (readyError) {
            console.error("Error checking tray_ready_to_use immediately from error:", readyError);
            // Switch to ready_to_use polling for retry
            setPollingMode('ready_to_use');
          }
        } else {
          // tray_ready_to_use check failed - navigate to dashboard
          console.log("Tray ready to use check error, navigating to dashboard");
          setPollingMode('stopped');
          navigate("/dashboard");
          return;
        }
      }
    };

    // Set up polling based on current mode
    const interval = setInterval(checkTrayStatus, 3000); // Poll every 3 seconds
    
    return () => clearInterval(interval);
  }, [binId, userId, navigate, pollingMode]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Countdown timer effect
  useEffect(() => {
    if (!isCountdownActive || countdown <= 0) {
      if (countdown <= 0 && isCountdownActive) {
        // Countdown reached zero, navigate to dashboard
        console.log("Countdown reached zero, navigating to dashboard");
        setIsCountdownActive(false);
        setPollingMode('stopped');
        navigate("/dashboard");
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsCountdownActive(false);
          setPollingMode('stopped');
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCountdownActive, countdown, navigate]);

  // Start countdown when tray is ready and loading is false
  // Fetch scanned items from API
  const fetchScannedItems = async () => {
    if (!orderRecord?.id) return;
    
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) return;

    try {
      const response = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/transactions?order_id=${orderRecord.id}&order_by_field=updated_at&order_by_type=DESC`,
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
        if (data.records) {
          setItems(data.records.map((record: any) => ({
            id: record.id,
            item_id: record.item_id,
            transaction_type: record.transaction_type
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching scanned items:', error);
      // Clear scanned items list and cache values when API fails
      setItems([]);
      sessionStorage.removeItem('currentOrderId');
      sessionStorage.removeItem('currentTrayId');
      sessionStorage.removeItem('currentUserId');
      sessionStorage.removeItem('trayStayTime');
    }
  };

  useEffect(() => {
    if (!isLoading && trayStatus === "tray_ready_to_use" && !isCountdownActive) {
      const trayStayTime = sessionStorage.getItem("trayStayTime");
      const minutes = parseInt(trayStayTime || "2");
      const totalSeconds = minutes * 60;
      console.log(`Starting countdown for ${minutes} minutes (${totalSeconds} seconds)`);
      setCountdown(totalSeconds);
      setIsCountdownActive(true);
    }
  }, [isLoading, trayStatus, isCountdownActive]);

  // Fetch scanned items when order is ready
  useEffect(() => {
    if (orderRecord?.id && trayStatus === "tray_ready_to_use") {
      fetchScannedItems();
    }
  }, [orderRecord?.id, trayStatus]);

  // Format countdown time
  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleScan = async (value: string) => {
    if (value.trim() === "") return;

    if (!VALID_ITEMS.includes(value.toLowerCase())) {
      setScannedItem("");
      setNotification({ type: 'error', message: "Item didn't added, invalid item" });
      return;
    }

    const authToken = sessionStorage.getItem("authToken");
    if (!authToken || !orderRecord?.id) {
      setNotification({ type: 'error', message: 'Order information missing' });
      return;
    }

    try {
      // Patch order to update and reset timer
      const patchResponse = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/orders?record_id=${orderRecord.id}`,
        {
          method: 'PATCH',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId
          }),
        }
      );

      if (patchResponse.ok) {
        const patchData = await patchResponse.json();
        console.log("Order patch response:", patchData);
        
        // Update order record with new data
        if (patchData.id) {
          setOrderRecord(patchData);
        }
        
        // Reset countdown timer
        const trayStayTime = sessionStorage.getItem("trayStayTime");
        const minutes = parseInt(trayStayTime || "2");
        const totalSeconds = minutes * 60;
        console.log(`Resetting countdown to ${minutes} minutes (${totalSeconds} seconds)`);
        setCountdown(totalSeconds);
        setIsCountdownActive(true);
      }

      // Create transaction
      const transactionResponse = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/transaction?order_id=${orderRecord.id}&item_id=${value.toLowerCase()}&transaction_item_quantity=1&transaction_type=inbound&transaction_date=${new Date().toISOString().split('T')[0]}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json();
        console.log("Transaction created:", transactionData);
        
        // Refresh the scanned items list
        await fetchScannedItems();
        setScannedItem("");
        setNotification({ type: 'success', message: 'Item added successfully' });
      } else {
        setNotification({ type: 'error', message: 'Failed to add item' });
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      setNotification({ type: 'error', message: 'Failed to add item' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleScan(scannedItem);
    }
  };

  const handleRemoveItem = (item: { id: number; item_id: string }) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) {
      setNotification({ type: 'error', message: 'Authentication token missing' });
      return;
    }

    try {
      const response = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/transaction?record_id=${itemToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        // Immediately remove the item from local state
        setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
        setNotification({ type: 'success', message: 'Item removed successfully' });
        
        // Try to refresh the list, but don't rely on it for immediate UI update
        try {
          await fetchScannedItems();
        } catch (refreshError) {
          console.error('Error refreshing list after delete:', refreshError);
          // List is already updated locally, so no need to show error to user
        }
      } else {
        setNotification({ type: 'error', message: 'Failed to remove item' });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setNotification({ type: 'error', message: 'Failed to remove item' });
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const handleCompleteOrder = async () => {
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken || !orderRecord?.id) {
      setNotification({ type: 'error', message: 'Order information missing' });
      return;
    }

    try {
      const response = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/orders/complete?record_id=${orderRecord.id}`,
        {
          method: 'PATCH',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        setShowCompleteDialog(true);
      } else {
        setNotification({ type: 'error', message: 'Failed to complete order' });
      }
    } catch (error) {
      console.error('Error completing order:', error);
      setNotification({ type: 'error', message: 'Failed to complete order' });
    }
  };

  const handleBack = () => {
    if (items.length > 0) {
      setShowBackConfirm(true);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background pt-44">
      <AppBar title="Scan Item to Inbound" showBack username={username} onBack={handleBack} />

      {isLoading ? (
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center justify-center">
          <div className="text-center space-y-6 animate-fade-in">
            <img
              src={robotAnimation}
              alt="Robot retrieving bin"
              className="w-full max-w-2xl mx-auto rounded-lg animate-pulse"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <PackagePlus className="h-8 w-8 text-red-600" />
                <h3 className="text-2xl sm:text-3xl font-semibold text-foreground">
                  Retrieving Bin {binId}
                </h3>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground">
                Robot is delivering the bin to the inbound station...
              </p>
            </div>
          </div>
        </main>
      ) : (
        <>
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="max-w-3xl mx-auto space-y-6">
            {/* Selected Bin */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Package className="h-6 w-6 text-red-600" />
                <h3 className="text-lg sm:text-xl font-medium text-foreground">
                  Selected Bin
                </h3>
              </div>
              <BinCard binId={binId} itemCount={3} />
              
              {/* Countdown Timer */}
              {isCountdownActive && countdown > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800">
                    Tray will release automatically in {formatCountdown(countdown)}
                  </p>
                </div>
              )}
            </div>

            {/* Scan Input */}
            <div className="space-y-2">
              <Label htmlFor="scan-input" className="text-base sm:text-lg">
                Scanned Item
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Barcode className="h-5 w-5 sm:h-6 sm:w-6 text-accent animate-scan-pulse" />
                </div>
                <Input
                  id="scan-input"
                  type="text"
                  value={scannedItem}
                  onChange={(e) => setScannedItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scan or enter item ID"
                  className="h-12 sm:h-14 pl-12 sm:pl-14 text-base sm:text-lg bg-background border-border focus:border-accent focus:ring-accent"
                  autoFocus
                />
              </div>
            </div>

            {/* Scanned Items List */}
            {items.length > 0 && (
              <div className="space-y-3 pb-4">
                <div className="flex items-center gap-3">
                  <PackageCheck className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg sm:text-xl font-medium text-foreground">
                    Scanned Items ({items.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <ItemCard key={item.id} itemId={item.item_id} transactionType={item.transaction_type} onRemove={() => handleRemoveItem(item)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Fixed Complete Order Button */}
        <div className="border-t border-border bg-background px-4 sm:px-6 lg:px-8 py-4 pb-6">
          <div className="max-w-3xl mx-auto">
            <Button
              onClick={handleCompleteOrder}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-smooth"
            >
              Complete Order
            </Button>
          </div>
        </div>
      </>
      )}

      <Footer />

      {/* Notification Popup */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className={`px-8 py-4 rounded-lg backdrop-blur-md ${
            notification.type === 'success' 
              ? 'bg-green-500/80' 
              : 'bg-red-500/80'
          } text-white text-lg font-semibold animate-fade-in shadow-xl`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Back Confirmation Dialog */}
      <AlertDialog open={showBackConfirm} onOpenChange={setShowBackConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Scanning?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {items.length} scanned item(s). Are you sure you want to go back? Your
              progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate(-1)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <BinCard binId={binId} itemCount={items.length} />
                {itemToDelete && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Item ID</p>
                    <p className="text-base font-medium text-foreground">{itemToDelete.item_id}</p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1 m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="flex-1 m-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Order Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order Completed Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your inbound order has been completed successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => navigate("/dashboard")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Return to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScanItemToInbound;
