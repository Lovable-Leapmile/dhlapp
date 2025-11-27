import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Package, ArrowUp, ArrowDown, Info, UserCog, LayoutDashboard } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";

  // Custom tray icons with arrows
  const InboundTrayIcon = () => (
    <div className="relative">
      <Package className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
      <ArrowUp className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 text-green-600 bg-white rounded-full p-1 animate-bounce" />
    </div>
  );

  const PickupTrayIcon = () => (
    <div className="relative">
      <Package className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
      <ArrowDown className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 text-red-600 bg-white rounded-full p-1 animate-bounce" />
    </div>
  );

  const navigationCards = [
    {
      title: "Inbound",
      icon: InboundTrayIcon,
      path: "/inbound/select-bin",
      description: "Manage incoming inventory",
    },
    {
      title: "Pickup",
      icon: PickupTrayIcon,
      path: "/pickup",
      description: "Process outbound items",
    },
    {
      title: "Station View",
      icon: Info,
      path: "/station-view",
      description: "Check station status",
    },
    {
      title: "Admin",
      icon: UserCog,
      path: "/admin",
      description: "System configuration",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Dashboard" username={username} showHomeIcon />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pt-44">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
            <LayoutDashboard className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground text-center">
              Select an Operation
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {navigationCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
                  onClick={() => navigate(card.path)}
                  className="p-8 sm:p-10 cursor-pointer transition-smooth active:scale-[0.98] bg-card border-border animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                        {card.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
