import { useState, useEffect } from "react";
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle,
  Navigation,
  Phone,
  Star,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeliveryAssignment, OrderDetails } from "@/hooks/useDeliveryAssignment";
import { useToast } from "@/hooks/use-toast";

export default function ActiveDeliveries() {
  const { 
    agentOrders, 
    startDelivery,
    confirmDelivery,
    getOrderDetails, 
    getOrderStatus,
    formatAmount,
    getEstimatedDeliveryTime,
    refetchAgentOrders 
  } = useDeliveryAssignment();
  const { toast } = useToast();
  
  const [orderDetailsMap, setOrderDetailsMap] = useState<Record<string, OrderDetails>>({});
  const [loadingOrders, setLoadingOrders] = useState<Record<string, boolean>>({});
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Fetch order details for each agent order
  useEffect(() => {
    const fetchOrderDetails = async () => {
      const newOrderDetails: Record<string, OrderDetails> = {};
      
      for (const orderId of agentOrders) {
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

    if (agentOrders.length > 0) {
      fetchOrderDetails();
    }
  }, [agentOrders, getOrderDetails, orderDetailsMap]);

  const handleStartDelivery = async (orderId: string) => {
    setLoadingOrders(prev => ({ ...prev, [orderId]: true }));
    const success = await startDelivery(orderId);
    setLoadingOrders(prev => ({ ...prev, [orderId]: false }));
    
    if (success) {
      // Refresh order details to get updated status
      await refetchAgentOrders();
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    setLoadingOrders(prev => ({ ...prev, [orderId]: true }));
    const success = await confirmDelivery(orderId);
    setLoadingOrders(prev => ({ ...prev, [orderId]: false }));
    
    if (success) {
      toast({
        title: "Delivery Completed!",
        description: "Great job! Payment has been released to the vendor.",
      });
      // Remove from local state as it's now completed
      setOrderDetailsMap(prev => {
        const newMap = { ...prev };
        delete newMap[orderId];
        return newMap;
      });
    }
  };

  const handleRefresh = () => {
    refetchAgentOrders();
    toast({
      title: "Refreshed",
      description: "Active deliveries updated",
    });
  };

  const getDeliveryProgress = (orderDetails: OrderDetails): number => {
    const status = getOrderStatus(orderDetails);
    switch (status) {
      case 'pending_assignment': return 25;
      case 'in_delivery': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending_assignment': return 'bg-yellow-500 text-yellow-50';
      case 'in_delivery': return 'bg-blue-500 text-blue-50';
      case 'completed': return 'bg-green-500 text-green-50';
      default: return 'bg-gray-500 text-gray-50';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending_assignment': return 'Assigned';
      case 'in_delivery': return 'In Transit';
      case 'completed': return 'Delivered';
      default: return 'Unknown';
    }
  };

  if (agentOrders.length === 0) {
    return (
      <Card className="rounded-xl border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-primary" />
            <span>Active Deliveries</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Truck className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Active Deliveries</h3>
          <p className="text-muted-foreground text-center mb-4">
            You don't have any active deliveries right now. 
            Check the order queue to accept new deliveries.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-primary" />
          <span>Active Deliveries ({agentOrders.length})</span>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agentOrders.map((orderId) => {
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

            const status = getOrderStatus(orderDetails);
            const progress = getDeliveryProgress(orderDetails);
            const estimatedTime = getEstimatedDeliveryTime(orderDetails.assignedAt);

            return (
              <Card key={orderId} className="rounded-xl border-border">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Order Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono">
                          {orderId}
                        </Badge>
                        <Badge className={getStatusColor(status)}>
                          {getStatusLabel(status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          ${formatAmount(orderDetails.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Order value</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Progress</span>
                        <span className="text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Delivery Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Customer:</span>
                          <span className="font-medium text-foreground font-mono">
                            {orderDetails.user.slice(0, 6)}...{orderDetails.user.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">ETA:</span>
                          <span className="font-medium text-foreground">{estimatedTime}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Vendor:</span>
                          <span className="font-medium text-foreground font-mono">
                            {orderDetails.vendor.slice(0, 6)}...{orderDetails.vendor.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Star className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Earn:</span>
                          <span className="font-medium text-secondary">
                            ${(formatAmount(orderDetails.amount) * 0.1).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {status === 'pending_assignment' && (
                        <Button
                          onClick={() => handleStartDelivery(orderId)}
                          disabled={isLoadingThisOrder}
                          className="flex-1 bg-gradient-trust"
                        >
                          {isLoadingThisOrder ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                              Starting...
                            </div>
                          ) : (
                            <>
                              <Navigation className="w-4 h-4 mr-2" />
                              Start Delivery
                            </>
                          )}
                        </Button>
                      )}
                      
                      {status === 'in_delivery' && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">
                                <MapPin className="w-4 h-4 mr-2" />
                                Track Route
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md rounded-2xl">
                              <DialogHeader>
                                <DialogTitle>Delivery Tracking - {orderId}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl">
                                  <p className="text-center text-muted-foreground mb-2">Mock GPS Tracking</p>
                                  <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                      <MapPin className="w-8 h-8 text-secondary mx-auto mb-2" />
                                      <p className="text-sm text-muted-foreground">
                                        En route to delivery location
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-center space-y-2">
                                  <p className="text-sm text-muted-foreground">Estimated arrival: {estimatedTime}</p>
                                  <Button variant="outline" size="sm">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Customer
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            onClick={() => handleConfirmDelivery(orderId)}
                            disabled={isLoadingThisOrder}
                            className="flex-1 bg-gradient-rewards"
                          >
                            {isLoadingThisOrder ? (
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                                Confirming...
                              </div>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Delivered
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}