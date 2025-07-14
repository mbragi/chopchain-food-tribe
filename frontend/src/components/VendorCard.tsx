import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

export interface Vendor {
 id: number;
 name: string;
 rating: number;
 deliveryTime: string;
 category: string;
 image: string;
 specialties: string[];
 priceRange: string;
 isOpen: boolean;
}

interface VendorCardProps {
 vendor: Vendor;
 onClick?: () => void;
 disabled?: boolean;
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor, onClick, disabled }) => (
 <Card
  className="overflow-hidden hover:shadow-card-hover transition-all duration-300 cursor-pointer rounded-2xl border-border"
  onClick={onClick}
 >
  <div className="relative">
   <div className="h-48 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
    <span className="text-muted-foreground">🍛 Vendor Image</span>
   </div>
   {/* Status badge */}
   <Badge
    className={`absolute top-3 right-3 ${vendor.isOpen
      ? "bg-secondary text-secondary-foreground"
      : "bg-muted text-muted-foreground"
     }`}
   >
    {vendor.isOpen ? "Open" : "Closed"}
   </Badge>
   {/* Price range */}
   <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
    {vendor.priceRange}
   </Badge>
  </div>
  <CardContent className="p-4">
   <div className="flex items-start justify-between mb-2">
    <h3 className="font-semibold text-lg text-foreground">
     {vendor.name}
    </h3>
    <div className="flex items-center space-x-1">
     <Star className="w-4 h-4 fill-accent text-accent" />
     <span className="text-sm font-medium">{vendor.rating}</span>
    </div>
   </div>
   <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
    <div className="flex items-center space-x-1">
     <Clock className="w-4 h-4" />
     <span>{vendor.deliveryTime}</span>
    </div>
    <Badge variant="outline" className="text-xs">
     {vendor.category}
    </Badge>
   </div>
   <div className="flex flex-wrap gap-1 mb-4">
    {vendor.specialties.map((specialty) => (
     <Badge
      key={specialty}
      variant="secondary"
      className="text-xs bg-accent/10 text-accent-foreground"
     >
      {specialty}
     </Badge>
    ))}
   </div>
   <Button
    className="w-full rounded-xl bg-gradient-sunset hover:shadow-glow"
    disabled={disabled || !vendor.isOpen}
    onClick={onClick}
   >
    {vendor.isOpen ? "View Menu" : "Currently Closed"}
   </Button>
  </CardContent>
 </Card>
); 