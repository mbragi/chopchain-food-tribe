import { useState } from "react";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MoreHorizontal,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock order data
const mockOrders = [
  {
    id: "ORD-001",
    customer: "0x1234...5678",
    items: ["2x Jollof Rice", "1x Pepper Soup"],
    total: 28.50,
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    deliveryAddress: "Victoria Island, Lagos",
    escrowStatus: "locked"
  },
  {
    id: "ORD-002", 
    customer: "0x8765...4321",
    items: ["1x Egusi", "1x Pounded Yam"],
    total: 22.75,
    status: "preparing",
    createdAt: "2024-01-15T09:15:00Z",
    deliveryAddress: "Ikoyi, Lagos",
    escrowStatus: "locked"
  },
  {
    id: "ORD-003",
    customer: "0x9876...1234", 
    items: ["3x Suya Platter"],
    total: 36.00,
    status: "ready",
    createdAt: "2024-01-15T08:45:00Z",
    deliveryAddress: "Lekki, Lagos",
    escrowStatus: "locked"
  },
  {
    id: "ORD-004",
    customer: "0x5555...9999",
    items: ["1x Moi Moi", "2x Plantain"],
    total: 15.25,
    status: "delivered",
    createdAt: "2024-01-14T16:20:00Z",
    deliveryAddress: "Surulere, Lagos",
    escrowStatus: "released"
  },
  {
    id: "ORD-005",
    customer: "0x3333...7777",
    items: ["1x Amala", "1x Ewedu"],
    total: 18.90,
    status: "confirmed",
    createdAt: "2024-01-14T14:10:00Z",
    deliveryAddress: "Ikeja, Lagos",
    escrowStatus: "released"
  }
];

export default function OrderManagement() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

  const statusConfig = {
    pending: { color: "bg-yellow-500 text-yellow-50", label: "Pending" },
    preparing: { color: "bg-blue-500 text-blue-50", label: "Preparing" },
    ready: { color: "bg-purple-500 text-purple-50", label: "Ready" },
    delivered: { color: "bg-green-500 text-green-50", label: "Delivered" },
    confirmed: { color: "bg-emerald-500 text-emerald-50", label: "Confirmed" },
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    // In real app, this would update the order status in database and possibly blockchain
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", count: mockOrders.filter(o => o.status === 'pending').length, color: "text-yellow-600" },
          { label: "Preparing", count: mockOrders.filter(o => o.status === 'preparing').length, color: "text-blue-600" },
          { label: "Ready", count: mockOrders.filter(o => o.status === 'ready').length, color: "text-purple-600" },
          { label: "Delivered", count: mockOrders.filter(o => o.status === 'delivered').length, color: "text-green-600" }
        ].map((stat) => (
          <Card key={stat.label} className="rounded-xl border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <Package className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Management</span>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 rounded-xl"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({mockOrders.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="preparing">Preparing</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus}>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Escrow</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell className="font-mono text-sm">{order.customer}</TableCell>
                        <TableCell>
                          <div className="max-w-48">
                            <p className="text-sm truncate">{order.items.join(", ")}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">${order.total}</TableCell>
                        <TableCell>
                          <Badge className={statusConfig[order.status as keyof typeof statusConfig].color}>
                            {statusConfig[order.status as keyof typeof statusConfig].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.escrowStatus === 'locked' ? 'secondary' : 'default'}>
                            {order.escrowStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md rounded-2xl">
                                <DialogHeader>
                                  <DialogTitle>Order Details - {order.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="font-semibold">Customer</p>
                                    <p className="text-sm font-mono text-muted-foreground">{order.customer}</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Items</p>
                                    <ul className="text-sm text-muted-foreground">
                                      {order.items.map((item, idx) => (
                                        <li key={idx}>• {item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Delivery Address</p>
                                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-semibold">${order.total}</span>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {order.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                    <Clock className="w-4 h-4 mr-2" />
                                    Start Preparing
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'preparing' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'ready')}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Ready
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'ready' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                    <Package className="w-4 h-4 mr-2" />
                                    Mark Delivered
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}