import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { BinCard } from "@/components/BinCard";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Barcode } from "lucide-react";
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

interface TrayStatusResponse {
  records: Array<{
    tray_id: string;
    tray_status: string;
  }>;
}

const VALID_ITEMS = ["item1", "item2", "item3", "item4", "item5"];

const ScanItemToInbound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const binId = location.state?.binId || "";
  const AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwNzIyMTMyOX0.yl2G3oNWNgXXyCyCLnj8IW0VZ2TezllqSdnhSyLg9NQ";
  const USER_ID = "1";

  const [isLoading, setIsLoading] = useState(true);
  const [trayStatus, setTrayStatus] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [scannedItem, setScannedItem] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Fetch order ID from API
  const fetchOrderId = async () => {
    try {
      const response = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/orders?tray_id=${binId}&user_id=${USER_ID}&order_by_field=updated_at&order_by_type=DESC&num_records=1`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`,
          }
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch order ID:", response.status);
        return;
      }

      const data = await response.json();
      if (data.records && data.records.length > 0) {
        setOrderId(data.records[0].id.toString());
        console.log("Order ID fetched:", data.records[0].id);
      }
    } catch (error) {
      console.error("Error fetching order ID:", error);
    }
  };

  // Check tray status periodically
  useEffect(() => {
    if (!binId) {
      toast.error("Invalid bin selection. Please try again.");
      navigate("/inbound/select-bin");
      return;
    }

    const checkTrayStatus = async () => {
      try {
        // First check for inprogress status
        const response = await fetch(
          `https://robotmanagerv1test.qikpod.com/nanostore/orders?tray_id=${binId}&tray_status=inprogress&user_id=${USER_ID}&order_by_field=updated_at&order_by_type=ASC&num_records=1`,
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
          }
        );

        if (response.ok) {
          const data: TrayStatusResponse = await response.json();
          
          if (data.records && data.records.length > 0) {
            setTrayStatus(data.records[0].tray_status);
            
            // Only show loading if tray is in progress
            if (data.records[0].tray_status === "inprogress") {
              setIsLoading(true);
            } else {
              // Tray is not in progress, ready for scanning
              setIsLoading(false);
            }
            return;
          }
        }

        // If no inprogress records found, check for failure status
        const failureResponse = await fetch(
          `https://robotmanagerv1test.qikpod.com/nanostore/orders?tray_id=${binId}&tray_status=failure&user_id=${USER_ID}&order_by_field=updated_at&order_by_type=ASC&num_records=1`,
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
          }
        );

        if (failureResponse.ok) {
          const failureData: TrayStatusResponse = await failureResponse.json();
          
          if (failureData.records && failureData.records.length > 0) {
            setTrayStatus("failure");
            setIsLoading(false); // Show scan items for failure status
            return;
          }
        }

        // If no specific status found, show scan items by default
        setIsLoading(false);
        setTrayStatus(null);
        
      } catch (error) {
        console.error("Error checking tray status:", error);
        // Don't show toast error to user, just log it
        setIsLoading(false);
        setTrayStatus(null);
      }
    };

    // Initial check
    checkTrayStatus();
    fetchOrderId(); // Fetch the order ID

    // Set up polling every 5 seconds
    const intervalId = setInterval(checkTrayStatus, 5000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [binId, AUTH_TOKEN, USER_ID, navigate]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleScan = async (item: string) => {
    if (!item.trim()) return;

    if (!orderId) {
      setNotification({ type: 'error', message: 'Order ID not found. Please try again.' });
      return;
    }

    try {
      // First, update the order with PATCH
      const patchResponse = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/orders?record_id=${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: '{}'
        }
      );

      if (!patchResponse.ok) {
        console.error("Failed to update order:", patchResponse.status);
        // Continue with transaction even if patch fails
      }

      // Then, create the transaction with POST
      const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const postResponse = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/transaction?order_id=${orderId}&item_id=${item}&transaction_item_quantity=1&transaction_type=inbound&transaction_date=${currentDate}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`,
          }
        }
      );

      if (!postResponse.ok) {
        throw new Error(`Failed to create transaction: ${postResponse.status}`);
      }

      const transactionData = await postResponse.json();
      console.log("Transaction created successfully:", transactionData);

      // Add item to the list
      setItems((prev) => [...prev, item]);
      setScannedItem("");
      setNotification({ type: 'success', message: `Item ${item} scanned successfully` });
    } catch (error) {
      console.error("Error scanning item:", error);
      setNotification({ type: 'error', message: 'Failed to scan item. Please try again.' });
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
    
    if (!orderId) {
      setNotification({ type: 'error', message: 'Order ID not found. Please try again.' });
      return;
    }

    try {
      const response = await fetch(
        `https://robotmanagerv1test.qikpod.com/nanostore/orders/complete?record_id=${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to complete order: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Order completed successfully:", responseData);
      
      toast.success("Order completed successfully!");
      navigate("/inbound/select-bin");
    } catch (error) {
      console.error("Error completing order:", error);
      setNotification({ type: 'error', message: 'Failed to complete order. Please try again.' });
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

      {isLoading && (!trayStatus || trayStatus === "inprogress") ? (
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center justify-center">
          <div className="text-center space-y-6 animate-fade-in">
            <img
              src={robotAnimation}
              alt="Robot retrieving bin"
              className="w-full max-w-2xl mx-auto rounded-lg animate-pulse"
            />
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Retrieving Bin...
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground">
                Robot is delivering the bin to the station...
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
