import { Package, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ItemCardProps {
  itemId: string;
  transactionType?: string;
  onRemove?: () => void;
}

export const ItemCard = ({ itemId, transactionType, onRemove }: ItemCardProps) => {
  return (
    <Card className="flex items-center gap-3 p-3 sm:p-4 bg-card border-border relative animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center">
        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base sm:text-lg font-normal text-foreground truncate">{itemId}</p>
      </div>
      {transactionType && (
        <div className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded ${
          transactionType === 'inbound' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : transactionType === 'outbound'
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-accent/10 text-accent'
        }`}>
          {transactionType}
        </div>
      )}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 hover:bg-destructive/10 hover:text-destructive transition-smooth"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
};
