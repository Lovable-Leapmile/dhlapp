import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Barcode } from "lucide-react";
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
  const [scannedItem, setScannedItem] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  useEffect(() => {
    const checkTrayStatus = async () => {
      const authToken = sessionStorage.getItem("authToken");
      
      if (!authToken || !binId || !userId) {
        console.error("Missing required data for tray status check");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Checking tray status for:", { binId, userId });
        
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
          console.log("Tray status response:", data);
          
          if (data.records && data.records.length > 0) {
            const order = data.records[0];
            setOrderRecord(order);
            setTrayStatus(order.tray_status || "");
            
            if (order.tray_status !== "inprogress") {
              setIsLoading(false);
            }
          } else {
            // No inprogress orders found - treat as ready
            console.log("No inprogress orders found");
            setIsLoading(false);
          }
        } else if (response.status === 404) {
          // No orders found - treat as ready
          console.log("No orders found (404)");
          setIsLoading(false);
        } else {
          console.error("Failed to check tray status:", response.status);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking tray status:", error);
        setIsLoading(false);
      }
    };

    checkTrayStatus();
    
    // Set up polling for tray status
    const interval = setInterval(checkTrayStatus, 5000);
    
    return () => clearInterval(interval);
  }, [binId, userId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      // Patch order to keep it active/updated
      await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/orders?record_id=${orderRecord.id}`,
        {
          method: 'PATCH',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: '{}',
        }
      );

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
        setItems((prev) => [...prev, value]);
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

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.info("Item removed");
  };

  const handleCompleteOrder = async () => {
    if (items.length === 0) {
      setNotification({ type: 'error', message: 'Please scan at least one item' });
      return;
    }

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
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Scan Item to Inbound" showBack username={username} onBack={handleBack} />

      {isLoading ? (
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center justify-center">
          <div className="text-center space-y-6 animate-fade-in">
            <img
              src={robotAnimation}
              alt="Robot retrieving bin"
              className="w-full max-w-2xl mx-auto rounded-lg animate-pulse"
            />
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Retrieving Bin {binId}
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground">
                Robot is delivering the bin to the inbound station...
              </p>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Selected Bin */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">
                Selected Bin
              </h3>
              <BinCard binId={binId} itemCount={3} />
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
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-medium text-foreground">
                  Scanned Items ({items.length})
                </h3>
                <div className="space-y-3 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
                  {items.map((item, index) => (
                    <ItemCard key={`${item}-${index}`} itemId={item} onRemove={() => handleRemoveItem(index)} />
                  ))}
                </div>
              </div>
            )}

            {/* Complete Button */}
            <div className="sticky bottom-0 pt-4 pb-2 bg-background">
              <Button
                onClick={handleCompleteOrder}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-smooth"
              >
                Complete Order
              </Button>
            </div>
          </div>
        </main>
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
