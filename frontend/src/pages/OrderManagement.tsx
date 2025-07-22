import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck,
  MapPin,
  User,
  DollarSign
} from "lucide-react";

type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";

interface Order {
  id: string;
  customerName: string;
  customerAddress: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  orderTime: string;
  estimatedDelivery?: string;
  paymentMethod: string;
}

export default function OrderManagement() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock orders data (would come from contract/backend)
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      customerName: "Kemi Adebayo",
      customerAddress: "15 Adeola Odeku Street, Victoria Island",
      items: [
        { name: "Jollof Rice", quantity: 2, price: 2500 },
        { name: "Grilled Chicken", quantity: 1, price: 3000 },
      ],
      total: 8000,
      status: "pending",
      orderTime: "2:30 PM",
      paymentMethod: "USDT",
    },
    {
      id: "ORD-002",
      customerName: "David Okafor",
      customerAddress: "23 Admiralty Way, Lekki Phase 1",
      items: [
        { name: "Pepper Soup", quantity: 1, price: 4000 },
        { name: "White Rice", quantity: 1, price: 1500 },
      ],
      total: 5500,
      status: "preparing",
      orderTime: "1:45 PM",
      estimatedDelivery: "3:15 PM",
      paymentMethod: "USDT",
    },
    {
      id: "ORD-003",
      customerName: "Sarah Lawal",
      customerAddress: "8 Ozumba Mbadiwe Avenue, Victoria Island",
      items: [
        { name: "Egusi Soup", quantity: 1, price: 3500 },
        { name: "Pounded Yam", quantity: 1, price: 2000 },
      ],
      total: 5500,
      status: "ready",
      orderTime: "12:20 PM",
      estimatedDelivery: "2:50 PM",
      paymentMethod: "USDT",
    },
  ]);

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      preparing: "bg-orange-100 text-orange-800",
      ready: "bg-green-100 text-green-800",
      out_for_delivery: "bg-purple-100 text-purple-800",
      delivered: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      pending: Clock,
      accepted: CheckCircle,
      preparing: Package,
      ready: Package,
      out_for_delivery: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
    };
    const Icon = icons[status];
    return <Icon className="w-4 h-4" />;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast({
      title: "Order Updated",
      description: `Order ${orderId} status changed to ${newStatus.replace('_', ' ')}`,
      variant: "default",
    });
  };

  const getNextActions = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return [
          { label: "Accept Order", status: "accepted" as OrderStatus, variant: "default" },
          { label: "Decline", status: "cancelled" as OrderStatus, variant: "destructive" },
        ];
      case "accepted":
        return [{ label: "Start Preparing", status: "preparing" as OrderStatus, variant: "default" }];
      case "preparing":
        return [{ label: "Mark Ready", status: "ready" as OrderStatus, variant: "default" }];
      case "ready":
        return [{ label: "Out for Delivery", status: "out_for_delivery" as OrderStatus, variant: "default" }];
      case "out_for_delivery":
        return [{ label: "Mark Delivered", status: "delivered" as OrderStatus, variant: "default" }];
      default:
        return [];
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Order Management</h1>
            <p className="text-muted-foreground">Track and manage all your incoming orders</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-trust text-primary-foreground">
              {filteredOrders.length} Orders
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by customer name or order ID..."
              className="pl-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{order.id}</h3>
                  <p className="text-sm text-muted-foreground">{order.orderTime}</p>
                </div>
                <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                  {getStatusIcon(order.status)}
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{order.customerName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm text-muted-foreground">{order.customerAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">₦{order.total.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">({order.paymentMethod})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {getNextActions(order.status).map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.variant as any}
                    onClick={() => updateOrderStatus(order.id, action.status)}
                    className={action.variant === "default" ? "bg-gradient-sunset" : ""}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders found matching your criteria</p>
          </div>
        )}

        {/* Order Details Modal */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Customer</h4>
                    <p className="text-sm">{selectedOrder.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customerAddress}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Order Info</h4>
                    <p className="text-sm">Time: {selectedOrder.orderTime}</p>
                    <p className="text-sm">Payment: {selectedOrder.paymentMethod}</p>
                    <Badge className={`${getStatusColor(selectedOrder.status)} mt-1`}>
                      {selectedOrder.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 font-semibold">
                      <span>Total</span>
                      <span>₦{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {getNextActions(selectedOrder.status).map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant as any}
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, action.status);
                        setSelectedOrder(null);
                      }}
                      className={action.variant === "default" ? "bg-gradient-sunset" : ""}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}