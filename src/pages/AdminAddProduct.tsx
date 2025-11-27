import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Package, CheckCircle } from "lucide-react";

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const [itemId, setItemId] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [addedItem, setAddedItem] = useState<{ item_id: string; item_description: string } | null>(null);
  const [error, setError] = useState("");

  const authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwNzIyMTMyOX0.yl2G3oNWNgXXyCyCLnj8IW0VZ2TezllqSdnhSyLg9NQ";

  const handleScanAgain = () => {
    if (itemId || itemDescription) {
      setShowConfirmDialog(true);
    } else {
      // Fields are already empty, just focus on first input
      document.getElementById("item-id")?.focus();
    }
  };

  const clearFields = () => {
    setItemId("");
    setItemDescription("");
    setError("");
    setShowConfirmDialog(false);
    document.getElementById("item-id")?.focus();
  };

  const handleConfirmItem = async () => {
    if (!itemId.trim() || !itemDescription.trim()) {
      setError("Both Item ID and Item Description are required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      console.log("Adding item:", { itemId, itemDescription });
      
      const response = await fetch(`https://robotmanagerv1test.qikpod.com/nanostore/item?item_id=${encodeURIComponent(itemId)}&item_description=${encodeURIComponent(itemDescription)}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log("Add Item API Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Add Item API Response:", result);

      // Set the added item for success dialog
      setAddedItem({ item_id: itemId, item_description: itemDescription });
      setShowSuccessDialog(true);
      
      // Clear fields after successful addition
      setItemId("");
      setItemDescription("");
      
    } catch (error) {
      console.error('Error adding item:', error);
      setError(error instanceof Error ? error.message : 'Failed to add item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirmItem();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Add Product" showBack username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pt-44">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header with Icon */}
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-accent/20 rounded-full flex items-center justify-center">
              <Plus className="w-12 h-12 sm:w-14 sm:h-14 text-accent" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground text-center">
              Add New Product
            </h2>
          </div>

          {/* Form */}
          <div className="bg-card rounded-xl shadow-medium p-6 sm:p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Item ID Field */}
            <div className="space-y-2">
              <Label htmlFor="item-id" className="text-base font-medium text-foreground">
                Scan Item ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="item-id"
                type="text"
                placeholder="Enter Item ID"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 sm:h-14 text-base sm:text-lg"
                required
              />
            </div>

            {/* Item Description Field */}
            <div className="space-y-2">
              <Label htmlFor="item-description" className="text-base font-medium text-foreground">
                Item Description <span className="text-red-500">*</span>
              </Label>
              <Input
                id="item-description"
                type="text"
                placeholder="Enter Item Description"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 sm:h-14 text-base sm:text-lg"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleScanAgain}
                className="h-12 sm:h-14 text-base sm:text-lg w-full"
              >
                Scan Again
              </Button>
              <Button
                onClick={handleConfirmItem}
                disabled={isLoading || !itemId.trim() || !itemDescription.trim()}
                className="h-12 sm:h-14 text-base sm:text-lg bg-accent hover:bg-accent/90 w-full"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Adding...
                  </div>
                ) : (
                  "Confirm Item"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Fields?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear the current item details? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearFields}>
              Clear Fields
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <AlertDialogHeader className="text-center">
              <AlertDialogTitle className="text-green-600">Item Added Successfully!</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                <div className="space-y-2">
                  <p>Item has been added to the system:</p>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p className="font-medium">Item ID: <span className="text-accent">{addedItem?.item_id}</span></p>
                    <p className="font-medium">Description: <span className="text-accent">{addedItem?.item_description}</span></p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="w-full">
              <AlertDialogAction 
                onClick={() => setShowSuccessDialog(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default AdminAddProduct;
