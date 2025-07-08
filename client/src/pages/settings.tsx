import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  ChevronLeft
} from "lucide-react";
import { api } from "@/lib/api";
import type { User as UserType, RideRequest } from "@shared/schema";
import { Link } from "wouter";

export default function Settings() {
  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
    queryFn: api.getUserProfile,
  });

  const { data: rideHistory = [], isLoading: historyLoading } = useQuery<RideRequest[]>({
    queryKey: ["/api/user/ride-history"], 
    queryFn: api.getRideHistory,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Calculate monthly car ownership cost (average $1200/month)
  const calculateSavingsRate = () => {
    if (!user) return 0;
    const membershipMonths = Math.max(1, Math.floor(
      (Date.now() - new Date(user.memberSince).getTime()) / (1000 * 60 * 60 * 24 * 30)
    ));
    const carOwnershipCost = membershipMonths * 1200; // $1200/month average
    const totalSpent = parseFloat(user.totalSpent);
    return carOwnershipCost - totalSpent;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">{user.phoneNumber || "No phone number"}</div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div className="text-sm capitalize">{user.preferredPayment} payment</div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">Member since {formatDate(user.memberSince)}</div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No account information available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ride Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Ride Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : user ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{user.totalRides}</div>
                  <div className="text-xs text-blue-600">Total Rides</div>
                </div>
                
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">${user.totalSpent}</div>
                  <div className="text-xs text-red-600">Total Spent</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${user.totalSavings}</div>
                  <div className="text-xs text-green-600">Total Savings</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${(parseFloat(user.totalSpent) / Math.max(1, user.totalRides)).toFixed(0)}
                  </div>
                  <div className="text-xs text-purple-600">Avg per Ride</div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Savings vs Car Ownership */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Rideshare Savings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${calculateSavingsRate().toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Saved vs. car ownership
                  </div>
                  <div className="text-xs text-gray-500">
                    Based on $1,200/month average car costs including payments, insurance, gas, maintenance, and parking
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Ride History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Rides</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : rideHistory.length > 0 ? (
              <div className="space-y-3">
                {rideHistory.slice(0, 5).map((ride) => (
                  <div key={ride.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {ride.fromLocation}
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {ride.preference}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        to {ride.toLocation}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateTime(ride.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {rideHistory.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm">
                      View All ({rideHistory.length} total)
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <div className="text-sm">No ride history yet</div>
                <div className="text-xs text-gray-400">Your rides will appear here</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Notification Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Payment Methods
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Settings
            </Button>
            <Separator />
            <Button variant="outline" className="w-full justify-start">
              Help & Support
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}