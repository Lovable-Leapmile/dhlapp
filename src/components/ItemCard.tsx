import { Package, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ItemCardProps {
  itemId: string;
  onRemove?: () => void;
}

export const ItemCard = ({ itemId, onRemove }: ItemCardProps) => {
  return (
    <Card className="flex items-center gap-3 p-3 sm:p-4 bg-card border-border relative animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center">
        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
      </div>
      <div className="flex-1">
        <p className="text-base sm:text-lg font-normal text-foreground">{itemId}</p>
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute top-2 right-2 h-6 w-6 sm:h-8 sm:w-8 hover:bg-destructive/10 hover:text-destructive transition-smooth"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
};
