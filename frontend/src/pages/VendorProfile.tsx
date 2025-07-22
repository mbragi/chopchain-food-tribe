import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { Star, MapPin, Clock, DollarSign, Edit3, Save } from "lucide-react";

export default function VendorProfile() {
  const { address } = useWallet();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mock vendor profile data (would come from contract/backend)
  const [profile, setProfile] = useState({
    name: "Mama Temi's Kitchen",
    email: "mama.temi@chopchain.com",
    phone: "+2348012345678",
    wallet: address || "0x1234...abcd",
    payoutMethod: "Bank Transfer",
    payoutSchedule: "Weekly",
    rating: 4.8,
    totalReviews: 127,
    businessHours: "9:00 AM - 10:00 PM",
    deliveryZone: "Lagos Island, Victoria Island",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setEditing(false);
      setSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your vendor profile has been saved successfully.",
        variant: "default",
      });
    }, 1000);
  };

  // Mock reviews data
  const mockReviews = [
    { id: 1, customer: "Kemi A.", rating: 5, comment: "Amazing jollof rice! Fast delivery too.", date: "2 days ago" },
    { id: 2, customer: "David O.", rating: 4, comment: "Good food, but could be spicier.", date: "5 days ago" },
    { id: 3, customer: "Sarah L.", rating: 5, comment: "Best pepper soup in Lagos!", date: "1 week ago" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Vendor Profile</h1>
            <p className="text-muted-foreground">Manage your business information and settings</p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="bg-gradient-sunset">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-sunset">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="payout">Payout</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Vendor Name</label>
                  <Input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    readOnly={!editing}
                    className={`rounded-xl ${!editing ? "bg-muted" : ""}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    readOnly={!editing}
                    className={`rounded-xl ${!editing ? "bg-muted" : ""}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Phone</label>
                  <Input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    readOnly={!editing}
                    className={`rounded-xl ${!editing ? "bg-muted" : ""}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Wallet Address</label>
                  <Input
                    name="wallet"
                    value={profile.wallet}
                    readOnly
                    className="rounded-xl bg-muted font-mono text-sm"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Payout Tab */}
          <TabsContent value="payout" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Payout Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Payout Method</label>
                  <Input
                    name="payoutMethod"
                    value={profile.payoutMethod}
                    onChange={handleChange}
                    readOnly={!editing}
                    className={`rounded-xl ${!editing ? "bg-muted" : ""}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Payout Schedule</label>
                  <Input
                    name="payoutSchedule"
                    value={profile.payoutSchedule}
                    onChange={handleChange}
                    readOnly={!editing}
                    className={`rounded-xl ${!editing ? "bg-muted" : ""}`}
                  />
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-trust/10 rounded-xl">
                <div className="flex items-center gap-2 text-secondary">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-medium">Next Payout: ₦45,200 on Friday</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Ratings & Reviews</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{profile.rating}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(profile.rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">{profile.totalReviews} reviews</div>
                </div>
                <div className="flex-1">
                  <Badge className="bg-gradient-rewards text-accent-foreground">Top Rated Vendor</Badge>
                </div>
              </div>
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{review.customer}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Business Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Business Hours</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      name="businessHours"
                      value={profile.businessHours}
                      onChange={handleChange}
                      readOnly={!editing}
                      className={`rounded-xl ${!editing ? "bg-muted" : ""}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Delivery Zone</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <Input
                      name="deliveryZone"
                      value={profile.deliveryZone}
                      onChange={handleChange}
                      readOnly={!editing}
                      className={`rounded-xl ${!editing ? "bg-muted" : ""}`}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}