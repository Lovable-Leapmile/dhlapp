import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import dhlLogo from "@/assets/dhl-logo.png";
import { Warehouse } from "lucide-react";
import { getApiUrl } from "@/utils/api";

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Validate mobile number - must be at least 6 digits for password derivation
    if (!/^\d+$/.test(mobileNumber) || mobileNumber.length < 6) {
      toast.error("Please enter a valid mobile number (at least 6 digits)");
      return;
    }

    // Derive password from last 6 digits
    const password = mobileNumber.slice(-6);

    setIsLoading(true);
    
    try {
      // Call validation API
      const apiUrl = getApiUrl(`/user/validate?user_phone=${mobileNumber}&password=${password}`);
      console.log('Login API URL:', apiUrl);
      console.log('Attempting to login with phone:', mobileNumber);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.user_name) {
        // Store user info and auth token in session
        sessionStorage.setItem("username", data.user_name);
        sessionStorage.setItem("userId", data.user_id?.toString() || "");
        sessionStorage.setItem("authToken", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkyMTY2MzgyNH0.hYv8hPzpQbGzAl0QXoIWddeF4gk9wPfPqwRMDTE4zas");
        
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        console.error('Login failed - Invalid credentials or missing user_name');
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
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
              Scan ID Number
            </p>
          </div>

          <div className="space-y-4">
            <Input 
              type="text" 
              placeholder="ID Number" 
              value={mobileNumber} 
              onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ""))} 
              onKeyPress={handleKeyPress} 
              className="h-12 sm:h-14 text-base sm:text-lg text-center bg-background border-border focus:border-accent focus:ring-accent" 
              autoFocus 
              disabled={isLoading}
            />

            <Button 
              onClick={handleLogin} 
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-smooth"
              disabled={isLoading}
            >
              {isLoading ? "Validating..." : "Login"}
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