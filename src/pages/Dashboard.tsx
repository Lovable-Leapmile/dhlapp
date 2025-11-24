import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { PackageCheck, PackageSearch, Settings } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";

  const navigationCards = [
    {
      title: "Inbound",
      icon: PackageCheck,
      path: "/inbound/select-bin",
      description: "Manage incoming inventory",
    },
    {
      title: "Pickup",
      icon: PackageSearch,
      path: "/pickup",
      description: "Process outbound items",
    },
    {
      title: "Admin",
      icon: Settings,
      path: "/admin",
      description: "System configuration",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Dashboard" username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 sm:mb-12 text-center">
            Select an Operation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {navigationCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
                  onClick={() => navigate(card.path)}
                  className="p-8 sm:p-10 cursor-pointer transition-smooth hover:shadow-medium hover:scale-[1.02] active:scale-[0.98] bg-card border-border animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent/20 rounded-2xl flex items-center justify-center">
                      <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-destructive" />
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
