import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Users, Package, Plus, History, Camera, BookOpen } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";

  const adminOptions = [
    {
      title: "Users",
      icon: Users,
      path: "/admin/users",
      description: "Manage user accounts",
    },
    {
      title: "Bins",
      icon: Package,
      path: "/admin/bins",
      description: "Manage bin inventory",
    },
    {
      title: "Add Product",
      icon: Plus,
      path: "/admin/add-product",
      description: "Add new products",
    },
    {
      title: "History",
      icon: History,
      path: "/admin/history",
      description: "View operation history",
    },
    {
      title: "Test Scanner",
      icon: Camera,
      path: "/admin/test-scanner",
      description: "Test scanner functionality",
    },
    {
      title: "Scanner Manual",
      icon: BookOpen,
      path: "/admin/scanner-manual",
      description: "Scanner user manual",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppBar title="Admin" showBack username={username} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pt-44">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground text-center">
              Admin Panel
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {adminOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.title}
                  onClick={() => navigate(option.path)}
                  className="p-6 sm:p-8 cursor-pointer transition-smooth active:scale-[0.98] bg-card border-border animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium text-foreground mb-1">
                        {option.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {option.description}
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

export default Admin;
