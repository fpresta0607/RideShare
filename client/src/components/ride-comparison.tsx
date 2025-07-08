import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import RideCard from "./ride-card";
import type { CompareRidesRequest, Ride } from "@shared/schema";

interface RideComparisonProps {
  searchData: CompareRidesRequest;
}

interface ComparisonResult {
  rides: Ride[];
  recommendedRide: Ride;
  tripInfo: {
    fromLocation: string;
    toLocation: string;
    estimatedDuration: string;
    preference: string;
  };
}

export default function RideComparison({ searchData }: RideComparisonProps) {
  const { data, isLoading, error } = useQuery<ComparisonResult>({
    queryKey: ["/api/rides/compare", searchData],
    queryFn: () => api.compareRides(searchData),
    enabled: !!searchData,
  });

  if (isLoading) {
    return (
      <section className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-16 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to find rides for this location. Please check your locations and try again.
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  if (!data) return null;

  const { rides, recommendedRide, tripInfo } = data;
  const uberRides = rides.filter(ride => ride.service === "uber");
  const lyftRides = rides.filter(ride => ride.service === "lyft");

  return (
    <section className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Available Rides</h3>
        <div className="text-sm text-gray-500">{tripInfo.estimatedDuration} trip</div>
      </div>

      {/* Recommended Ride Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">Best match for your preference</span>
        </div>
      </div>

      {/* Uber Options */}
      <div className="space-y-3">
        {uberRides.map((ride) => (
          <RideCard 
            key={ride.id} 
            ride={ride} 
            isRecommended={ride.id === recommendedRide.id}
          />
        ))}
      </div>

      {/* Lyft Options */}
      <div className="space-y-3 mt-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-1 bg-pink-500 rounded"></div>
          <span className="text-sm font-medium text-gray-600">LYFT OPTIONS</span>
        </div>
        
        {lyftRides.map((ride) => (
          <RideCard 
            key={ride.id} 
            ride={ride} 
            isRecommended={ride.id === recommendedRide.id}
          />
        ))}
      </div>
    </section>
  );
}
