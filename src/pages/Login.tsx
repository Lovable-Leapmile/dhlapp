import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import dhlLogo from "@/assets/dhl-logo.png";
import { Warehouse } from "lucide-react";
const Login = () => {
  const [idNumber, setIdNumber] = useState("");
  const navigate = useNavigate();
  const handleLogin = () => {
    // Simple validation - only allow numbers
    if (!/^\d+$/.test(idNumber) || idNumber.length === 0) {
      toast.error("Please enter a valid identification number (numbers only)");
      return;
    }

    // Store username in session
    sessionStorage.setItem("username", idNumber);
    toast.success("Login successful!");
    navigate("/dashboard");
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };
  return <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <img src={dhlLogo} alt="DHL Supply Chain" className="h-16 sm:h-20 mx-auto mb-6" />
        </div>

        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 sm:w-28 sm:h-28 bg-accent/10 rounded-full flex items-center justify-center">
            <Warehouse className="w-15 h-14 sm:w-14 sm:h-14 text-accent" />
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-xl shadow-medium p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-center text-muted-foreground">
              Scan Identification QR  
            </p>
          </div>

          <div className="space-y-4">
            <Input type="text" placeholder="Scan Identification Number" value={idNumber} onChange={e => setIdNumber(e.target.value.replace(/\D/g, ""))} onKeyPress={handleKeyPress} className="h-12 sm:h-14 text-base sm:text-lg text-center bg-background border-border focus:border-accent focus:ring-accent" autoFocus />

            <Button onClick={handleLogin} className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-smooth">
              Login
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground">
          Powered by <span className="font-medium text-foreground">leapmile</span> © 2025
        </p>
      </div>
    </div>;
};
export default Login;