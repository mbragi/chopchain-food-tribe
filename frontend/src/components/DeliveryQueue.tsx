import { useState, useEffect } from "react";
import { 
  Package, 
  MapPin, 
  Clock, 
  DollarSign,
  Truck,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeliveryAssignment, OrderDetails } from "@/hooks/useDeliveryAssignment";
import { useDeliveryAgentRegistry } from "@/hooks/useDeliveryAgentRegistry";
import { useToast } from "@/hooks/use-toast";

export default function DeliveryQueue() {
  const { 
    unassignedOrders, 
    assignToOrder, 
    getOrderDetails, 
    formatAmount,
    isLoading,
    refetchUnassignedOrders 
  } = useDeliveryAssignment();
  const { isAgentActive } = useDeliveryAgentRegistry();
  const { toast } = useToast();
  
  const [orderDetailsMap, setOrderDetailsMap] = useState<Record<string, OrderDetails>>({});
  const [loadingOrders, setLoadingOrders] = useState<Record<string, boolean>>({});

  // Fetch order details for each unassigned order
  useEffect(() => {
    const fetchOrderDetails = async () => {
      const newOrderDetails: Record<string, OrderDetails> = {};
      
      for (const orderId of unassignedOrders) {
        if (!orderDetailsMap[orderId]) {
          try {
            const details = await getOrderDetails(orderId);
            if (details) {
              newOrderDetails[orderId] = details;
            }
          } catch (error) {
            console.error(`Failed to fetch details for order ${orderId}:`, error);
          }
        }
      }
      
      if (Object.keys(newOrderDetails).length > 0) {
        setOrderDetailsMap(prev => ({ ...prev, ...newOrderDetails }));
      }
    };

    if (unassignedOrders.length > 0) {
      fetchOrderDetails();
    }
  }, [unassignedOrders, getOrderDetails, orderDetailsMap]);

  const handleAssignOrder = async (orderId: string) => {
    if (!isAgentActive) {
      toast({
        title: "Go Online First",
        description: "You need to be online to accept orders",
        variant: "destructive"
      });
      return;
    }

    setLoadingOrders(prev => ({ ...prev, [orderId]: true }));
    const success = await assignToOrder(orderId);
    setLoadingOrders(prev => ({ ...prev, [orderId]: false }));

    if (success) {
      // Remove from local state as it will be moved to agent orders
      setOrderDetailsMap(prev => {
        const newMap = { ...prev };
        delete newMap[orderId];
        return newMap;
      });
    }
  };

  const handleRefresh = () => {
    refetchUnassignedOrders();
    toast({
      title: "Refreshed",
      description: "Order queue updated",
    });
  };

  if (unassignedOrders.length === 0) {
    return (
      <Card className="rounded-xl border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-primary" />
            <span>Available Orders</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Available</h3>
          <p className="text-muted-foreground text-center mb-4">
            There are currently no unassigned orders in your area. 
            Check back shortly or refresh to see new orders.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Queue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-primary" />
          <span>Available Orders ({unassignedOrders.length})</span>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {!isAgentActive && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">
              You must be online to accept delivery orders
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {unassignedOrders.map((orderId) => {
            const orderDetails = orderDetailsMap[orderId];
            const isLoadingThisOrder = loadingOrders[orderId];
            
            if (!orderDetails) {
              return (
                <Card key={orderId} className="rounded-xl border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-muted-foreground">Loading order details...</span>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={orderId} className="rounded-xl border-border hover:shadow-card-hover transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Order Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-mono">
                            {orderId}
                          </Badge>
                          <Badge className="bg-gradient-sunset text-primary-foreground">
                            New Order
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">
                            ${formatAmount(orderDetails.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Order value</p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Vendor:</span>
                            <span className="font-medium text-foreground font-mono">
                              {orderDetails.vendor.slice(0, 6)}...{orderDetails.vendor.slice(-4)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Customer:</span>
                            <span className="font-medium text-foreground font-mono">
                              {orderDetails.user.slice(0, 6)}...{orderDetails.user.slice(-4)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Placed:</span>
                            <span className="font-medium text-foreground">Just now</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Est. earning:</span>
                            <span className="font-medium text-secondary">
                              ${(formatAmount(orderDetails.amount) * 0.1).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button
                          onClick={() => handleAssignOrder(orderId)}
                          disabled={!isAgentActive || isLoadingThisOrder}
                          className="w-full bg-gradient-trust hover:shadow-glow"
                          size="lg"
                        >
                          {isLoadingThisOrder ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                              Accepting...
                            </div>
                          ) : (
                            <>
                              <Truck className="w-4 h-4 mr-2" />
                              Accept Delivery
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {unassignedOrders.length > 5 && (
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {unassignedOrders.length} available orders in your area
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}