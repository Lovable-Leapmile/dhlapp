import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, PackageOpen, History, ArrowDown, ArrowUp, Tag, Archive, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [showNoTransactionMessage, setShowNoTransactionMessage] = useState(false);
  const numRecords = 10;

  const authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwNzIyMTMyOX0.yl2G3oNWNgXXyCyCLnj8IW0VZ2TezllqSdnhSyLg9NQ";

  const fetchInboundTransactions = async () => {
    try {
      setIsLoadingInbound(true);
      
      const offset = inboundPage * numRecords;
      let apiUrl = `${import.meta.env.VITE_BASE_URL}/nanostore/transactions?transaction_type=inbound&order_by_field=updated_at&order_by_type=DESC`;
      
      // When date is selected, fetch all records to apply client-side filtering
      if (selectedDate) {
        apiUrl += `&num_records=1000`; // Fetch more records for filtering
      } else {
        apiUrl += `&num_records=${numRecords}&offset=${offset}`;
      }
      
      // Add date filter if selected - try different approaches
      if (selectedDate) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        // Try generic date parameter first
        apiUrl += `&date=${formattedDate}`;
      }
      
      console.log("Fetching inbound transactions...", { offset, numRecords, page: inboundPage, selectedDate, formattedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null });
      const response = await fetch(apiUrl, {
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
      
      // Handle API response structure and apply client-side date filter if needed
      let transactions = [];
      let totalCount = 0;
      
      if (data && typeof data === 'object') {
        if (data.records && Array.isArray(data.records)) {
          transactions = data.records;
          totalCount = data.total_records || data.total_count || transactions.length;
        } else if (Array.isArray(data)) {
          transactions = data;
          totalCount = transactions.length;
        } else {
          const possibleArrays = Object.values(data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            transactions = possibleArrays[0];
            totalCount = transactions.length;
          }
        }
      }
      
      // Apply client-side date filter if API doesn't support it
      if (selectedDate && transactions.length > 0) {
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const allFilteredTransactions = transactions.filter(transaction => {
          const transactionDate = transaction.created_at ? transaction.created_at.split('T')[0] : null;
          return transactionDate === selectedDateStr;
        });
        
        // Apply pagination to filtered results
        totalCount = allFilteredTransactions.length;
        const paginatedTransactions = allFilteredTransactions.slice(inboundPage * numRecords, (inboundPage + 1) * numRecords);
        transactions = paginatedTransactions;
        
        // Show no transaction message if no results
        if (totalCount === 0) {
          setShowNoTransactionMessage(true);
          setTimeout(() => setShowNoTransactionMessage(false), 3000);
        }
      }
      
      console.log("Setting inbound data:", { transactions: transactions.length, totalCount });
      setInboundTransactions(transactions);
      setInboundTotalRecords(totalCount);
    } catch (error) {
      console.error('Error fetching inbound transactions:', error);
      setInboundTransactions([]);
      setInboundTotalRecords(0);
    } finally {
      setIsLoadingInbound(false);
    }
  };

  const fetchPickupTransactions = async () => {
    try {
      setIsLoadingPickup(true);
      
      const offset = pickupPage * numRecords;
      let apiUrl = `${import.meta.env.VITE_BASE_URL}/nanostore/transactions?transaction_type=outbound&order_by_field=updated_at&order_by_type=DESC`;
      
      // When date is selected, fetch all records to apply client-side filtering
      if (selectedDate) {
        apiUrl += `&num_records=1000`; // Fetch more records for filtering
      } else {
        apiUrl += `&num_records=${numRecords}&offset=${offset}`;
      }
      
      // Add date filter if selected - try different approaches
      if (selectedDate) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        // Try generic date parameter first
        apiUrl += `&date=${formattedDate}`;
      }
      
      console.log("Fetching pickup transactions...", { offset, numRecords, page: pickupPage, selectedDate, formattedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null });
      const response = await fetch(apiUrl, {
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
      
      // Handle API response structure and apply client-side date filter if needed
      let transactions = [];
      let totalCount = 0;
      
      if (data && typeof data === 'object') {
        if (data.records && Array.isArray(data.records)) {
          transactions = data.records;
          totalCount = data.total_records || data.total_count || transactions.length;
        } else if (Array.isArray(data)) {
          transactions = data;
          totalCount = transactions.length;
        } else {
          const possibleArrays = Object.values(data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            transactions = possibleArrays[0];
            totalCount = transactions.length;
          }
        }
      }
      
      // Apply client-side date filter if API doesn't support it
      if (selectedDate && transactions.length > 0) {
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const allFilteredTransactions = transactions.filter(transaction => {
          const transactionDate = transaction.created_at ? transaction.created_at.split('T')[0] : null;
          return transactionDate === selectedDateStr;
        });
        
        // Apply pagination to filtered results
        totalCount = allFilteredTransactions.length;
        const paginatedTransactions = allFilteredTransactions.slice(pickupPage * numRecords, (pickupPage + 1) * numRecords);
        transactions = paginatedTransactions;
      }
      
      console.log("Setting pickup data:", { transactions: transactions.length, totalCount });
      setPickupTransactions(transactions);
      setPickupTotalRecords(totalCount);
    } catch (error) {
      console.error('Error fetching pickup transactions:', error);
      setPickupTransactions([]);
      setPickupTotalRecords(0);
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
  }, [activeTab, inboundPage, pickupPage, selectedDate]);

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

  const clearDateFilter = () => {
    setSelectedDate(undefined);
    setShowNoTransactionMessage(false);
    // Reset to first page when clearing filter
    if (activeTab === "inbound") {
      setInboundPage(0);
    } else {
      setPickupPage(0);
    }
  };

  // Fetch available dates for calendar
  const fetchAvailableDates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/nanostore/transactions?transaction_type=${activeTab}&num_records=1000`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        let transactions = [];
        
        if (data && typeof data === 'object') {
          if (data.records && Array.isArray(data.records)) {
            transactions = data.records;
          } else if (Array.isArray(data)) {
            transactions = data;
          }
        }
        
        // Extract unique dates
        const dates = new Set<string>();
        transactions.forEach(transaction => {
          if (transaction.created_at) {
            const dateStr = transaction.created_at.split('T')[0];
            dates.add(dateStr);
          }
        });
        
        setAvailableDates(dates);
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  // Reset pagination when date changes
  useEffect(() => {
    if (selectedDate) {
      if (activeTab === "inbound") {
        setInboundPage(0);
      } else {
        setPickupPage(0);
      }
    }
  }, [selectedDate, activeTab]);

  // Fetch available dates when tab changes
  useEffect(() => {
    fetchAvailableDates();
  }, [activeTab]);

  // Check if date has transactions
  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availableDates.has(dateStr);
  };

  // Handle date selection with validation
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      setShowNoTransactionMessage(false);
      return;
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!availableDates.has(dateStr)) {
      setShowNoTransactionMessage(true);
      setTimeout(() => setShowNoTransactionMessage(false), 3000);
      return;
    }
    
    setSelectedDate(date);
    setShowNoTransactionMessage(false);
    // Close the popover after selection
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  };

  const TransactionCard = ({ transaction, type }: { transaction: Transaction; type: "inbound" | "pickup" }) => (
    <Card className="p-3 sm:p-4 bg-card border-border">
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === "inbound" ? (
              <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            ) : (
              <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
            )}
            <span className="text-sm sm:text-base font-semibold text-foreground capitalize">{type}</span>
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {formatDate(transaction.updated_at)}
          </span>
        </div>
        
        {/* Details Grid - More compact on mobile */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3">
          {/* Item ID with Icon */}
          <div className="flex items-start gap-1.5 sm:gap-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
              <Tag className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground block">Item ID</span>
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">{transaction.item_id}</span>
            </div>
          </div>

          {/* Tray ID with Icon */}
          <div className="flex items-start gap-1.5 sm:gap-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
              <Archive className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-gray-600" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground block">Tray ID</span>
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">{transaction.tray_id}</span>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground block">Quantity</span>
              <span className="text-xs sm:text-sm font-medium text-foreground">{Math.abs(transaction.transaction_item_quantity)}</span>
            </div>
          </div>

          {/* Username */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground block">Username</span>
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">{transaction.user_name}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Transaction History" showBack username={username} />

      {/* No Transaction Message Popup */}
      {showNoTransactionMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg">
          No {activeTab} transactions found on selected date
        </div>
      )}

      {/* Fixed content container */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-4 flex-shrink-0">
          <div className="max-w-6xl mx-auto space-y-4">
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

            {/* Pagination and Calendar Filter */}
            <div className="flex items-center justify-between gap-2 py-1 px-2 border-y border-border bg-background">
              {activeTab === "inbound" && inboundTransactions.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setInboundPage(prev => Math.max(0, prev - 1))}
                    disabled={inboundPage === 0}
                    className="h-10 w-10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-sm font-medium text-foreground">
                      ( {inboundPage + 1} / {Math.max(1, Math.ceil(inboundTotalRecords / numRecords))} ) {inboundTotalRecords} total
                      {selectedDate && ` - ${format(selectedDate, 'MMM dd, yyyy')}`}
                    </span>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-10 w-10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
                          selectedDate ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        modifiers={{
                          available: isDateAvailable,
                        }}
                        modifiersStyles={{
                          available: {
                            backgroundColor: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                            borderRadius: '6px',
                          },
                          disabled: {
                            opacity: 0.3,
                            textDecoration: 'line-through',
                          },
                        }}
                        disabled={(date) => !isDateAvailable(date)}
                      />
                    </PopoverContent>
                  </Popover>

                  {selectedDate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearDateFilter}
                      className="h-10 px-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Clear
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setInboundPage(prev => prev + 1)}
                    disabled={(inboundPage + 1) * numRecords >= inboundTotalRecords}
                    className="h-10 w-10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {activeTab === "pickup" && pickupTransactions.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPickupPage(prev => Math.max(0, prev - 1))}
                    disabled={pickupPage === 0}
                    className="h-10 w-10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-sm font-medium text-foreground">
                      ( {pickupPage + 1} / {Math.max(1, Math.ceil(pickupTotalRecords / numRecords))} ) {pickupTotalRecords} total
                      {selectedDate && ` - ${format(selectedDate, 'MMM dd, yyyy')}`}
                    </span>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-10 w-10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
                          selectedDate ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        modifiers={{
                          available: isDateAvailable,
                        }}
                        modifiersStyles={{
                          available: {
                            backgroundColor: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                            borderRadius: '6px',
                          },
                          disabled: {
                            opacity: 0.3,
                            textDecoration: 'line-through',
                          },
                        }}
                        disabled={(date) => !isDateAvailable(date)}
                      />
                    </PopoverContent>
                  </Popover>

                  {selectedDate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearDateFilter}
                      className="h-10 px-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Clear
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPickupPage(prev => prev + 1)}
                    disabled={(pickupPage + 1) * numRecords >= pickupTotalRecords}
                    className="h-10 w-10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Scrollable cards container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-4 pb-4">
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
                      {selectedDate 
                        ? `No inbound transactions found on ${format(selectedDate, 'MMM dd, yyyy')}. Try selecting a different date.`
                        : 'No inbound transactions found in the system.'}
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
                      {selectedDate 
                        ? `No pickup transactions found on ${format(selectedDate, 'MMM dd, yyyy')}. Try selecting a different date.`
                        : 'No pickup transactions found in the system.'}
                    </p>
                  </div>
                )
              )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminHistory;
