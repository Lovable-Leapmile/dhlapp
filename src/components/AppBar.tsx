import { ArrowLeft, LogOut, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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

interface AppBarProps {
  title: string;
  showBack?: boolean;
  username?: string;
  showHomeIcon?: boolean;
  onBack?: () => void;
}

export const AppBar = ({ title, showBack = false, username = "John Doe", showHomeIcon = false, onBack }: AppBarProps) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <>
      <header className="glass-effect shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-3 gap-3">
            {/* Top section - Title and Logout */}
            <div className="flex items-center justify-between">
              {/* Left - Back button */}
              <div className="flex items-center gap-3">
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
                {/* Hidden spacer button for centering when no back button */}
                {!showBack && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    className="opacity-0 pointer-events-none invisible"
                  >
                    <ArrowLeft className="h-5 w-5 opacity-0" />
                  </Button>
                )}
              </div>

              {/* Center - Title */}
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  {showHomeIcon && (
                    <Home className="h-5 w-5 sm:h-6 sm:w-6 text-destructive flex-shrink-0" />
                  )}
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground leading-none">
                    {title}
                  </h1>
                </div>
              </div>

              {/* Right - Logout */}
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogoutClick}
                  className="transition-smooth hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            </div>

            {/* Bottom section - User ID */}
            <div className="flex justify-center">
              <div className="bg-accent px-6 py-2 rounded-full">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  User – {username}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to scan your identification number again to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
