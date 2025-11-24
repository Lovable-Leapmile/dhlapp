import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SelectInboundBin from "./pages/SelectInboundBin";
import ScanItemToInbound from "./pages/ScanItemToInbound";
import Pickup from "./pages/Pickup";
import SelectPickupBin from "./pages/SelectPickupBin";
import ScanItemToPickup from "./pages/ScanItemToPickup";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inbound/select-bin" element={<SelectInboundBin />} />
          <Route path="/inbound/scan-items" element={<ScanItemToInbound />} />
          <Route path="/pickup" element={<Pickup />} />
          <Route path="/pickup/select-bin" element={<SelectPickupBin />} />
          <Route path="/pickup/scan-items" element={<ScanItemToPickup />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
