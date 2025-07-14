import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import React from "react";

export interface MenuItem {
 id: number;
 name: string;
 description: string;
 price: number;
 image: string;
 category: string;
 popular?: boolean;
 spicyLevel?: number;
}

interface MenuItemCardProps {
 item: MenuItem;
 quantity: number;
 add: (id: number) => void;
 remove: (id: number) => void;
 getSpicyIndicator?: (level: number | undefined) => React.ReactNode;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, quantity, add, remove, getSpicyIndicator }) => (
 <Card className="overflow-hidden rounded-xl border-border hover:shadow-card-hover transition-all">
  <CardContent className="p-0">
   <div className="flex">
    <div className="flex-1 p-4">
     <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
       <div className="flex items-center space-x-2 mb-1">
        <h3 className="font-semibold text-foreground">{item.name}</h3>
        {item.popular && (
         <Badge className="bg-accent/20 text-accent-foreground text-xs">
          Popular
         </Badge>
        )}
        {getSpicyIndicator && getSpicyIndicator(item.spicyLevel) && (
         <span className="text-xs">{getSpicyIndicator(item.spicyLevel)}</span>
        )}
       </div>
       <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
       <p className="text-lg font-bold text-primary">${item.price}</p>
      </div>
     </div>
     {/* Add to cart controls */}
     <div className="flex items-center space-x-2">
      {quantity > 0 ? (
       <div className="flex items-center space-x-2">
        <Button
         size="sm"
         variant="outline"
         onClick={() => remove(item.id)}
         className="w-8 h-8 p-0 rounded-lg"
        >
         <Minus className="w-4 h-4" />
        </Button>
        <span className="font-medium w-8 text-center">{quantity}</span>
        <Button
         size="sm"
         onClick={() => add(item.id)}
         className="w-8 h-8 p-0 rounded-lg bg-gradient-sunset"
        >
         <Plus className="w-4 h-4" />
        </Button>
       </div>
      ) : (
       <Button
        size="sm"
        onClick={() => add(item.id)}
        className="bg-gradient-sunset hover:shadow-glow rounded-lg"
       >
        <Plus className="w-4 h-4 mr-1" />
        Add
       </Button>
      )}
     </div>
    </div>
    {/* Item image */}
    <div className="w-24 h-24 m-4 bg-gradient-to-br from-muted to-muted/60 rounded-xl flex items-center justify-center flex-shrink-0">
     <span className="text-2xl">🍽️</span>
    </div>
   </div>
  </CardContent>
 </Card>
); 