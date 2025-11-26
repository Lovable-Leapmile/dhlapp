import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const testQRValues = ["00M95", "00N9G", "01JFY", "04C11"];

const AdminTestScanner = () => {
  const [itemId, setItemId] = useState("");
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddItem = () => {
    if (itemId.trim()) {
      setScannedItems((prev) => [...prev, itemId]);
      
      // Show success popup
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      
      // Clear the input field
      setItemId("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleClear = () => {
    setItemId("");
    setScannedItems([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Test Scanner" showBack />
      
      <main className="flex-1 px-6 py-8 pb-24 overflow-y-auto">
        {/* Item ID Input */}
        <div className="mb-8">
          <Label htmlFor="itemId" className="text-base mb-2 block">Item ID</Label>
          <div className="flex gap-2">
            <Input
              id="itemId"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter item ID"
              className="text-base flex-1"
            />
            <Button onClick={handleAddItem} disabled={!itemId.trim()}>
              Add
            </Button>
          </div>
        </div>

        {/* Test QR Codes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Test QR Code</h2>
          <div className="grid grid-cols-2 gap-6">
            {testQRValues.map((value) => (
              <div
                key={value}
                className="bg-card p-4 rounded-lg shadow-sm flex flex-col items-center"
              >
                <QRCodeSVG value={value} size={120} level="M" />
                <p className="mt-3 text-sm font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scanned Items Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Scanned Items</h2>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={scannedItems.length === 0}
            >
              Clear
            </Button>
          </div>
          
          {scannedItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No items scanned yet</p>
          ) : (
            <div className="space-y-2">
              {scannedItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-card p-4 rounded-lg shadow-sm"
                >
                  <p className="text-base">Item ID – {item}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500/90 backdrop-blur-md text-white px-8 py-4 rounded-lg shadow-lg">
            <p className="text-base font-medium">Item scanned successfully</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestScanner;
