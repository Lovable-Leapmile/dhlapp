import { Card } from "@/components/ui/card";
import bin1 from "@/assets/bin1.png";
import bin2 from "@/assets/bin2.png";

interface BinCardProps {
  binId: string;
  itemCount: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export const BinCard = ({ binId, itemCount, onClick, isSelected = false }: BinCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={`flex items-center gap-2 sm:gap-3 p-3 cursor-pointer transition-smooth active:scale-[0.98] bg-card border-2 ${isSelected ? 'border-primary' : 'border-border'}`}
    >
      <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-accent/20 rounded-lg flex items-center justify-center p-1.5 sm:p-2">
        <img 
          src={itemCount > 0 ? bin1 : bin2} 
          alt={itemCount > 0 ? "Bin with items" : "Empty bin"}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-xs text-muted-foreground">Bin ID</p>
        <div className="flex items-center gap-1.5">
          <p className="text-base sm:text-lg font-semibold text-foreground">{binId}</p>
          {itemCount === 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              Empty
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">({itemCount} items)</p>
      </div>
    </Card>
  );
};
