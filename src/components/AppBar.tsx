import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import dhlLogo from "@/assets/dhl-logo.png";

interface AppBarProps {
  title: string;
  showBack?: boolean;
  username?: string;
}

export const AppBar = ({ title, showBack = false, username = "John Doe" }: AppBarProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="glass-effect shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="transition-smooth hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <img src={dhlLogo} alt="DHL Supply Chain" className="h-8 sm:h-10 w-auto" />
          </div>

          {/* Center section */}
          <div className="text-center flex-1 px-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              User – {username}
            </p>
          </div>

          {/* Right section */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="transition-smooth hover:bg-muted"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
