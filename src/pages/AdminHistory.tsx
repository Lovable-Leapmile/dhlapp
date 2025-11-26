import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, PackageOpen, History, ArrowDown, ArrowUp, Tag, Archive, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

interface Transaction {
  id: number;
  status: string | null;
  created_at: string;
  updated_at: string;
  order_id: number;
  sap_order_reference: string | null;
  item_id: string;
  transaction_type: string;
  transaction_item_quantity: number;
  transaction_date: string;
  comment: string | null;
  tray_id: string;
  station_id: string;
  station_friendly_name: string;
  station_tags: string[];
  user_id: number;
  order_ref: string | null;
  movement_type: string | null;
  material: string | null;
  user_name: string;
  user_phone: string;
  user_type: string;
}

const AdminHistory = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";
  const [activeTab, setActiveTab] = useState<"inbound" | "pickup">("inbound");
  const [inboundTransactions, setInboundTransactions] = useState<Transaction[]>([]);
  const [pickupTransactions, setPickupTransactions] = useState<Transaction[]>([]);
  const [isLoadingInbound, setIsLoadingInbound] = useState(true);
  const [isLoadingPickup, setIsLoadingPickup] = useState(true);
  const [error, setError] = useState("");
  const [inboundPage, setInboundPage] = useState(0);
  const [pickupPage, setPickupPage] = useState(0);
  const [inboundTotalRecords, setInboundTotalRecords] = useState(0);
  const [pickupTotalRecords, setPickupTotalRecords] = useState(0);
  const numRecords = 10;

  const authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwNzIyMTMyOX0.yl2G3oNWNgXXyCyCLnj8IW0VZ2TezllqSdnhSyLg9NQ";

  const fetchInboundTransactions = async () => {
    try {
      setIsLoadingInbound(true);
      
      const offset = inboundPage * numRecords;
      console.log("Fetching inbound transactions...", { offset, numRecords });
      const response = await fetch(`https://robotmanagerv1test.qikpod.com/nanostore/transactions?transaction_type=inbound&order_by_field=updated_at&order_by_type=DESC&num_records=${numRecords}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log("Inbound API Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Inbound API Response Data:", data);
      
      // Handle API response structure
      let transactions = [];
      if (data && typeof data === 'object') {
        if (data.records && Array.isArray(data.records)) {
          transactions = data.records;
          setInboundTotalRecords(data.total_records || transactions.length);
        } else if (Array.isArray(data)) {
          transactions = data;
          setInboundTotalRecords(transactions.length);
        } else {
          const possibleArrays = Object.values(data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            transactions = possibleArrays[0];
            setInboundTotalRecords(transactions.length);
          }
        }
      }
      
      setInboundTransactions(transactions);
    } catch (error) {
      console.error('Error fetching inbound transactions:', error);
      setInboundTransactions([]);
    } finally {
      setIsLoadingInbound(false);
    }
  };

  const fetchPickupTransactions = async () => {
    try {
      setIsLoadingPickup(true);
      
      const offset = pickupPage * numRecords;
      console.log("Fetching pickup transactions...", { offset, numRecords });
      const response = await fetch(`https://robotmanagerv1test.qikpod.com/nanostore/transactions?transaction_type=outbound&order_by_field=updated_at&order_by_type=DESC&num_records=${numRecords}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log("Pickup API Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Pickup API Response Data:", data);
      
      // Handle API response structure
      let transactions = [];
      if (data && typeof data === 'object') {
        if (data.records && Array.isArray(data.records)) {
          transactions = data.records;
          setPickupTotalRecords(data.total_records || transactions.length);
        } else if (Array.isArray(data)) {
          transactions = data;
          setPickupTotalRecords(transactions.length);
        } else {
          const possibleArrays = Object.values(data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            transactions = possibleArrays[0];
            setPickupTotalRecords(transactions.length);
          }
        }
      }
      
      setPickupTransactions(transactions);
    } catch (error) {
      console.error('Error fetching pickup transactions:', error);
      setPickupTransactions([]);
    } finally {
      setIsLoadingPickup(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inbound") {
      fetchInboundTransactions();
    } else {
      fetchPickupTransactions();
    }
  }, [activeTab, inboundPage, pickupPage]);

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

  const TransactionCard = ({ transaction, type }: { transaction: Transaction; type: "inbound" | "pickup" }) => (
    <Card className="p-4 bg-card border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === "inbound" ? (
              <ArrowDown className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowUp className="w-4 h-4 text-red-600" />
            )}
            <span className="text-lg font-semibold text-foreground capitalize">{type}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDate(transaction.updated_at)}
          </span>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Item ID with Icon */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground block">Item ID</span>
              <span className="text-sm font-medium text-foreground truncate">{transaction.item_id}</span>
            </div>
          </div>

          {/* Tray ID with Icon */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
              <Archive className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground block">Tray ID</span>
              <span className="text-sm font-medium text-foreground truncate">{transaction.tray_id}</span>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground block">Description</span>
              <span className="text-sm font-medium text-foreground truncate">{transaction.item_id}</span>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground block">Quantity</span>
              <span className="text-sm font-medium text-foreground">{Math.abs(transaction.transaction_item_quantity)}</span>
            </div>
          </div>

          {/* Username */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground block">Username</span>
              <span className="text-sm font-medium text-foreground truncate">{transaction.user_name}</span>
            </div>
          </div>

          {/* Transaction Time */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground block">Transaction Time</span>
              <span className="text-sm font-medium text-foreground">{transaction.transaction_date}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Transaction History" showBack username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-center gap-3">
            <History className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground text-center">
              Transaction History
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex justify-center w-full">
            <div className="inline-flex rounded-lg border border-border p-1 bg-muted/20 w-full">
              <Button
                variant={activeTab === "inbound" ? "default" : "ghost"}
                onClick={() => setActiveTab("inbound")}
                className="flex-1 px-6 py-2 rounded-md"
              >
                <ArrowDown className="w-4 h-4 mr-2" />
                Inbound
              </Button>
              <Button
                variant={activeTab === "pickup" ? "default" : "ghost"}
                onClick={() => setActiveTab("pickup")}
                className="flex-1 px-6 py-2 rounded-md"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Pickup
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4 max-h-[calc(100vh-500px)] overflow-y-auto">
            {activeTab === "inbound" ? (
              isLoadingInbound ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-lg text-muted-foreground">Loading inbound transactions...</p>
                  </div>
                </div>
              ) : inboundTransactions.length > 0 ? (
                inboundTransactions.map((transaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} type="inbound" />
                ))
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <ArrowDown className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <ArrowDown className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-foreground">
                      No Inbound Transactions
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    No inbound transactions found in the system.
                  </p>
                </div>
              )
            ) : (
              isLoadingPickup ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-lg text-muted-foreground">Loading pickup transactions...</p>
                  </div>
                </div>
              ) : pickupTransactions.length > 0 ? (
                pickupTransactions.map((transaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} type="pickup" />
                ))
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <ArrowUp className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <ArrowUp className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-foreground">
                      No Pickup Transactions
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    No pickup transactions found in the system.
                  </p>
                </div>
              )
            )}
            </div>

            {/* Pagination */}
            {activeTab === "inbound" && inboundTransactions.length > 0 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInboundPage(prev => Math.max(0, prev - 1))}
                      disabled={inboundPage === 0}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm text-muted-foreground px-4">
                      {inboundPage * numRecords + 1}-{Math.min((inboundPage + 1) * numRecords, inboundTotalRecords)} of {inboundTotalRecords}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInboundPage(prev => prev + 1)}
                      disabled={(inboundPage + 1) * numRecords >= inboundTotalRecords}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {activeTab === "pickup" && pickupTransactions.length > 0 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPickupPage(prev => Math.max(0, prev - 1))}
                      disabled={pickupPage === 0}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm text-muted-foreground px-4">
                      {pickupPage * numRecords + 1}-{Math.min((pickupPage + 1) * numRecords, pickupTotalRecords)} of {pickupTotalRecords}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPickupPage(prev => prev + 1)}
                      disabled={(pickupPage + 1) * numRecords >= pickupTotalRecords}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminHistory;
