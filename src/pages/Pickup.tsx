import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { Construction } from "lucide-react";

const Pickup = () => {
  const username = sessionStorage.getItem("username") || "Guest";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Pickup" showBack username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Construction className="w-12 h-12 sm:w-16 sm:h-16 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Work in Progress
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Coming soon
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pickup;
