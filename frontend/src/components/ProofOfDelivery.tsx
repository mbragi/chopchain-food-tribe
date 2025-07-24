import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  User, 
  Star,
  Camera,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useEnhancedCheckout } from '@/hooks/useEnhancedCheckout';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

interface ProofOfDeliveryProps {
  orderId: string;
  orderDetails: {
    items: Array<{ name: string; quantity: number; price: number }>;
    vendor: string;
    deliveryAddress: string;
    totalAmount: string;
    customerAddress: string;
    deliveryAgentAddress?: string;
  };
  userRole: 'customer' | 'delivery_agent';
  onDeliveryConfirmed?: () => void;
}

export default function ProofOfDelivery({ 
  orderId, 
  orderDetails, 
  userRole,
  onDeliveryConfirmed 
}: ProofOfDeliveryProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [deliveryCode, setDeliveryCode] = useState('');

  const { confirmOrderDelivery } = useEnhancedCheckout();
  const { connected, address } = useWallet();
  const { toast } = useToast();

  // Check if user is authorized to confirm delivery
  const isAuthorized = address === orderDetails.customerAddress || 
                      address === orderDetails.deliveryAgentAddress;

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + proofImages.length > 3) {
      toast({
        title: 'Too Many Images',
        description: 'You can upload maximum 3 images as proof of delivery',
        variant: 'destructive'
      });
      return;
    }
    setProofImages(prev => [...prev, ...files]);
  }, [proofImages.length, toast]);

  const removeImage = useCallback((index: number) => {
    setProofImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleConfirmDelivery = useCallback(async () => {
    if (!connected || !isAuthorized) {
      toast({
        title: 'Not Authorized',
        description: 'You are not authorized to confirm this delivery',
        variant: 'destructive'
      });
      return;
    }

    // For delivery agents, require delivery code and proof images
    if (userRole === 'delivery_agent') {
      if (!deliveryCode || deliveryCode.length < 4) {
        toast({
          title: 'Delivery Code Required',
          description: 'Please enter the 4-digit delivery code provided by the customer',
          variant: 'destructive'
        });
        return;
      }

      if (proofImages.length === 0) {
        toast({
          title: 'Proof Required',
          description: 'Please upload at least one image as proof of delivery',
          variant: 'destructive'
        });
        return;
      }
    }

    setIsConfirming(true);

    try {
      // In a real implementation, we would:
      // 1. Upload proof images to IPFS or similar
      // 2. Include image hashes and metadata in the transaction
      // 3. Verify delivery code if applicable

      const success = await confirmOrderDelivery(orderId);
      
      if (success) {
        toast({
          title: 'Delivery Confirmed!',
          description: userRole === 'customer' 
            ? 'Payment has been released to the vendor and CHOP tokens have been earned!'
            : 'Delivery confirmed successfully. Payment will be released upon customer confirmation.',
        });

        // Call parent callback
        onDeliveryConfirmed?.();
      }
    } catch (error) {
      console.error('Delivery confirmation error:', error);
    } finally {
      setIsConfirming(false);
    }
  }, [
    connected,
    isAuthorized,
    userRole,
    deliveryCode,
    proofImages.length,
    orderId,
    confirmOrderDelivery,
    onDeliveryConfirmed,
    toast
  ]);

  const renderStars = useCallback((currentRating: number, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-6 h-6 cursor-pointer transition-colors ${
          index < currentRating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300 hover:text-yellow-400'
        }`}
        onClick={() => onRatingChange?.(index + 1)}
      />
    ));
  }, []);

  if (!connected) {
    return (
      <Card className="rounded-2xl border-border">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
          <p className="text-muted-foreground">
            Please connect your wallet to confirm delivery.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthorized) {
    return (
      <Card className="rounded-2xl border-border">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Not Authorized</h3>
          <p className="text-muted-foreground">
            You are not authorized to confirm this delivery.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Delivery Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
              <p className="font-mono text-sm bg-muted p-2 rounded-lg">{orderId}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
              <p className="font-semibold text-lg">{orderDetails.totalAmount}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Delivery Address
            </Label>
            <p>{orderDetails.deliveryAddress}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Order Items</Label>
            <div className="space-y-1">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Agent Specific Fields */}
      {userRole === 'delivery_agent' && (
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle>Delivery Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryCode">Customer Delivery Code</Label>
              <Input
                id="deliveryCode"
                placeholder="Enter 4-digit code"
                value={deliveryCode}
                onChange={(e) => setDeliveryCode(e.target.value)}
                maxLength={4}
                className="text-center text-2xl font-mono tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Ask the customer for their 4-digit delivery code
              </p>
            </div>

            <div className="space-y-2">
              <Label>Proof of Delivery Images</Label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {proofImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Proof ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="proof-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload delivery photos (max 3)
                    </p>
                  </div>
                  <input
                    id="proof-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={proofImages.length >= 3}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating and Feedback */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle>
            {userRole === 'customer' ? 'Rate Your Experience' : 'Rate This Order'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center space-x-1">
              {renderStars(rating, setRating)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder={
                userRole === 'customer'
                  ? 'How was your delivery experience?'
                  : 'Any notes about this delivery?'
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="rounded-xl"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Button */}
      <Card className="rounded-2xl border-border">
        <CardContent className="p-6">
          <Button
            onClick={handleConfirmDelivery}
            disabled={isConfirming}
            className="w-full h-12 bg-gradient-sunset hover:shadow-glow text-lg font-semibold rounded-xl"
          >
            {isConfirming ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Confirming Delivery...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                {userRole === 'customer' ? 'Confirm Delivery & Release Payment' : 'Mark as Delivered'}
              </>
            )}
          </Button>

          {userRole === 'customer' && (
            <div className="mt-4 p-4 bg-primary/10 rounded-xl">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Confirming delivery will:</p>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>• Release payment to the vendor</li>
                    <li>• Mint CHOP tokens to your wallet</li>
                    <li>• Complete the order permanently</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}