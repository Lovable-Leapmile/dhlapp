import { ArrowLeft, LogOut } from "lucide-react";
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
}

export const AppBar = ({ title, showBack = false, username = "John Doe" }: AppBarProps) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleBack = () => {
    navigate(-1);
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
            </div>

            {/* Center section */}
            <div className="text-center flex-1 px-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">
                {title}
              </h1>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-accent/20 px-4 py-2 rounded-full">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  User – {username}
                </p>
              </div>
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
