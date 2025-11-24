import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BinCardProps {
  binId: string;
  itemCount: number;
  onClick?: () => void;
}

export const BinCard = ({ binId, itemCount, onClick }: BinCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="flex items-center gap-4 p-4 cursor-pointer transition-smooth active:scale-[0.98] bg-card border-border"
    >
      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-accent/20 rounded-lg flex items-center justify-center">
        <Package className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm text-muted-foreground">Bin ID</p>
        <div className="flex items-center gap-2">
          <p className="text-lg sm:text-xl font-semibold text-foreground">{binId}</p>
          {itemCount === 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              Empty
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">({itemCount} items)</p>
      </div>
    </Card>
  );
};
