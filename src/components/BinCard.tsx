import { Card } from "@/components/ui/card";
import bin1 from "@/assets/bin1.png";
import bin2 from "@/assets/bin2.png";

interface BinCardProps {
  binId: string;
  itemCount: number;
  onClick?: () => void;
}

export const BinCard = ({ binId, itemCount, onClick }: BinCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="flex items-center gap-1.5 sm:gap-3 p-2 sm:p-4 cursor-pointer transition-smooth active:scale-[0.98] bg-card border-border relative w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[240px] h-[60px] sm:h-[80px]"
    >
      {itemCount === 0 && (
        <span className="absolute top-1 sm:top-2 right-1 sm:right-2 text-[8px] sm:text-[10px] px-0.5 sm:px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
          Empty
        </span>
      )}
      <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-accent/20 rounded-lg flex items-center justify-center p-1 sm:p-2">
        <img 
          src={itemCount > 0 ? bin1 : bin2} 
          alt={itemCount > 0 ? "Bin with items" : "Empty bin"}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[8px] sm:text-xs text-muted-foreground">Bin ID</p>
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          <p className="text-xs sm:text-base font-medium text-foreground truncate">{binId}</p>
        </div>
        <p className="text-[8px] sm:text-xs text-muted-foreground">({itemCount} items)</p>
      </div>
    </Card>
  );
};
