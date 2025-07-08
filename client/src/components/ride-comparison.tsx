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
  
  // Sort rides with recommended at the top, then by the user's preference
  const sortedRides = [...rides].sort((a, b) => {
    // Recommended ride always comes first
    if (a.id === recommendedRide.id) return -1;
    if (b.id === recommendedRide.id) return 1;
    
    // Then sort by preference
    switch (tripInfo.preference) {
      case 'price':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'speed':
        return a.eta - b.eta;
      case 'luxury':
        // For luxury, prioritize high luxury level (4-5) cars, then by lowest price
        const aIsLuxury = a.luxuryLevel >= 4;
        const bIsLuxury = b.luxuryLevel >= 4;
        
        if (aIsLuxury && !bIsLuxury) return -1;
        if (!aIsLuxury && bIsLuxury) return 1;
        if (aIsLuxury && bIsLuxury) {
          // Both are luxury, sort by price
          return parseFloat(a.price) - parseFloat(b.price);
        }
        // Neither is luxury, sort by luxury level
        return b.luxuryLevel - a.luxuryLevel;
      default:
        return 0;
    }
  });

  return (
    <section className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Available Rides</h3>
        <div className="text-sm text-gray-500">{tripInfo.estimatedDuration} trip</div>
      </div>

      {/* Preference indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Sorted by {tripInfo.preference === 'speed' ? 'fastest pickup' : tripInfo.preference === 'luxury' ? 'luxury level' : 'best price'}
          </span>
        </div>
      </div>

      {/* All rides sorted with recommended first */}
      <div className="space-y-3">
        {sortedRides.map((ride, index) => (
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
