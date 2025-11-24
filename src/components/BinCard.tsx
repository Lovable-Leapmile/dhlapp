import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
interface BinCardProps {
  binId: string;
  itemCount: number;
  onClick?: () => void;
}
export const BinCard = ({
  binId,
  itemCount,
  onClick
}: BinCardProps) => {
  return <Card onClick={onClick} className="flex items-center gap-4 p-4 cursor-pointer transition-smooth hover:shadow-medium hover:scale-[1.02] active:scale-[0.98] bg-card border-border">
      
      <div className="flex-1 text-left">
        
        <p className="text-lg sm:text-xl font-semibold text-foreground">{binId}</p>
        <p className="text-sm text-muted-foreground">({itemCount} items)</p>
      </div>
    </Card>;
};