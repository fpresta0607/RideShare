import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function Settings() {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'1W' | '3M' | '6M' | '1Y' | 'ALL'>('ALL');

  // Generate time series data for the savings chart
  const generateTimeSeriesData = (analyticsData: any, period: string) => {
    const now = new Date();
    const dataPoints: { date: string; savings: number }[] = [];
    
    // Determine the number of data points based on period
    const periodConfig = {
      '1W': { months: 0.25, points: 7 },
      '3M': { months: 3, points: 12 },
      '6M': { months: 6, points: 24 },
      '1Y': { months: 12, points: 52 },
      'ALL': { months: 24, points: 24 }
    };
    
    const config = periodConfig[period as keyof typeof periodConfig];
    const pointsCount = config.points;
    
    // Generate cumulative savings data points
    for (let i = pointsCount - 1; i >= 0; i--) {
      const date = new Date(now);
      
      // Calculate days back based on period
      let daysBack;
      if (period === '1W') {
        daysBack = (i * 7) / pointsCount;
      } else {
        daysBack = (i * (config.months * 30)) / pointsCount;
      }
      
      date.setDate(date.getDate() - daysBack);
      
      // Simulate progressive savings growth with realistic patterns
      const progress = (pointsCount - i) / pointsCount;
      const totalSavings = analyticsData?.totalSavings || 47.85;
      const baseGrowth = totalSavings * progress;
      
      // Add some realistic variance based on ride frequency
      const variance = period === '1W' ? 
        Math.sin(progress * Math.PI * 2) * 2 : // Daily fluctuations
        (Math.random() - 0.5) * 3; // Longer term variance
      
      const savings = Math.max(0, baseGrowth + variance);
      
      // Format date based on period
      let dateLabel;
      if (period === '1W') {
        dateLabel = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      dataPoints.push({
        date: dateLabel,
        savings: Math.round(savings * 100) / 100
      });
    }
    
    return dataPoints;
  };

  const { data: userProfile, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
    queryFn: api.getUserProfile,
  });

  const { data: rideHistory = [], isLoading: historyLoading } = useQuery<RideRequest[]>({
    queryKey: ["/api/user/ride-history"], 
    queryFn: api.getRideHistory,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/user/savings-analytics", analyticsPeriod],
    queryFn: () => api.getSavingsAnalytics(analyticsPeriod),
  });

  // Check if we're using demo data
  const isDemoUser = !!localStorage.getItem('demoUser');
  const demoUserData = isDemoUser ? JSON.parse(localStorage.getItem('demoUser') || '{}') : {};

  // Provide fallback values with demo data support
  const safeUserProfile = userProfile || {
    totalSavings: isDemoUser ? demoUserData.totalSavings || '47.85' : '0.00',
    totalTimeSaved: isDemoUser ? demoUserData.totalTimeSaved || 78 : 0,
    totalRides: isDemoUser ? demoUserData.totalRides || 15 : 0,
    name: isDemoUser ? demoUserData.name || 'Franco Presta' : '',
    email: isDemoUser ? demoUserData.email || 'fpresta0607@gmail.com' : '',
    phoneNumber: isDemoUser ? demoUserData.phoneNumber || '+1 (630) 674-9978' : '',
    preferredPayment: isDemoUser ? demoUserData.preferredPayment || 'card' : 'card',
    memberSince: isDemoUser ? demoUserData.memberSince || new Date().toISOString() : new Date().toISOString()
  };

  const safeAnalyticsData = analyticsData || {
    totalSavings: isDemoUser ? 47.85 : 0,
    priceSavings: isDemoUser ? 32.40 : 0,
    luxurySavings: isDemoUser ? 15.45 : 0,
    totalMinutesSaved: isDemoUser ? 78 : 0,
    rideCount: isDemoUser ? 15 : 0,
    cumulativeData: []
  };

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

  const calculateAccumulatedSavings = () => {
    if (!userProfile) return 0;
    return parseFloat(userProfile.totalSavings || '0');
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
            ) : userProfile ? (
              <>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{userProfile.name}</div>
                    <div className="text-sm text-gray-500">{userProfile.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">{userProfile.phoneNumber || "No phone number"}</div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div className="text-sm capitalize">{userProfile.preferredPayment} payment</div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">Member since {formatDate(userProfile.memberSince || new Date().toISOString())}</div>
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
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center space-y-1">
                  <div className="text-xl font-bold text-gray-900">
                    {safeUserProfile.totalRides}
                  </div>
                  <div className="text-sm text-gray-600">Total rides</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-xl font-bold text-green-600">
                    ${safeUserProfile.totalSavings}
                  </div>
                  <div className="text-sm text-gray-600">Total saved</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-xl font-bold text-blue-600">
                    {safeUserProfile.totalTimeSaved}
                  </div>
                  <div className="text-sm text-gray-600">Minutes saved</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-xl font-bold text-purple-600">
                    ${(parseFloat(safeUserProfile.totalSavings || '0') * 12).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">Yearly projection</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Savings Analytics</span>
              </div>
              <div className="flex space-x-1 flex-wrap">
                {(['1W', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={analyticsPeriod === period ? "default" : "ghost"}
                    size="sm"
                    className="text-xs px-2 py-1 h-6"
                    onClick={() => setAnalyticsPeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Total Savings</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900 mt-2">
                      ${safeAnalyticsData.totalSavings.toFixed(2)}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      All ride optimizations
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Time Savings</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900 mt-2">
                      {isDemoUser ? 78 : safeUserProfile.totalTimeSaved} min
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      Faster pickup times
                    </div>
                  </div>
                </div>
                
                {/* Savings Over Time Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Savings Over Time</h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateTimeSeriesData(safeAnalyticsData, analyticsPeriod)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Savings']}
                          labelFormatter={(label) => `Date: ${label}`}
                          contentStyle={{ 
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="savings" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Savings Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">💰 Price comparisons</span>
                      <button 
                        className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full text-xs flex items-center justify-center hover:bg-gray-300"
                        title="Savings from choosing the cheaper option between Uber and Lyft for the same trip"
                      >
                        ?
                      </button>
                    </div>
                    <span className="font-medium text-green-600">
                      ${safeAnalyticsData.priceSavings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">✨ Luxury deals</span>
                      <button 
                        className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full text-xs flex items-center justify-center hover:bg-gray-300"
                        title="Savings from finding better priced luxury rides compared to similar premium options"
                      >
                        ?
                      </button>
                    </div>
                    <span className="font-medium text-amber-600">
                      ${safeAnalyticsData.luxurySavings.toFixed(2)}
                    </span>
                  </div>

                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Rides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Recent Rides</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : rideHistory.length > 0 ? (
              <div className="space-y-3">
                {rideHistory.slice(0, 5).map((ride) => (
                  <div key={ride.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
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
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={() => {
                const isDemoUser = !!localStorage.getItem('demoUser');
                if (isDemoUser) {
                  // Clear demo user and force page reload
                  localStorage.removeItem('demoUser');
                  window.location.reload();
                } else {
                  // Regular logout for authenticated users - force logout then reload
                  fetch('/api/logout', { method: 'GET' })
                    .then(() => {
                      // Clear any cached auth state
                      localStorage.clear();
                      sessionStorage.clear();
                      // Force page reload to clear React Query cache
                      window.location.href = '/';
                    })
                    .catch(() => {
                      // Fallback - just reload the page
                      window.location.href = '/';
                    });
                }
              }}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}