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

  // Calculate potential savings based on difference between top two options
  const calculateSavings = () => {
    const preference = tripInfo.preference;
    
    // Sort rides by preference to find top two
    const sortedRides = [...rides].sort((a, b) => {
      switch (preference) {
        case 'price':
          return parseFloat(String(a.price).replace('$', '')) - parseFloat(String(b.price).replace('$', ''));
        case 'speed':
          return (a.eta || 0) - (b.eta || 0);
        case 'luxury':
          const aIsLuxury = (a.luxuryLevel || 0) >= 4;
          const bIsLuxury = (b.luxuryLevel || 0) >= 4;
          if (aIsLuxury && !bIsLuxury) return -1;
          if (!aIsLuxury && bIsLuxury) return 1;
          if (aIsLuxury && bIsLuxury) {
            return parseFloat(String(a.price).replace('$', '')) - parseFloat(String(b.price).replace('$', ''));
          }
          return (b.luxuryLevel || 0) - (a.luxuryLevel || 0);
        default:
          return 0;
      }
    });

    if (sortedRides.length < 2) {
      return { savings: 0, minutes: 0 };
    }

    const bestOption = sortedRides[0];
    const secondBestOption = sortedRides[1];
    
    if (preference === "price" || preference === "luxury") {
      const bestPrice = parseFloat(String(bestOption.price).replace('$', ''));
      const secondPrice = parseFloat(String(secondBestOption.price).replace('$', ''));
      return { savings: Math.max(0, secondPrice - bestPrice), minutes: 0 };
    } else if (preference === "speed") {
      const bestEta = bestOption.eta || 0;
      const secondEta = secondBestOption.eta || 0;
      const minutesSaved = Math.max(0, secondEta - bestEta);
      return { savings: 0, minutes: minutesSaved };
    }
    
    return { savings: 0, minutes: 0 };
  };

  const { savings: potentialSavings, minutes: minutesSaved } = calculateSavings();
  
  // Sort rides with recommended at the top, then by the user's preference
  const sortedRides = [...rides].sort((a, b) => {
    // Recommended ride always comes first
    if (a.id === recommendedRide.id) return -1;
    if (b.id === recommendedRide.id) return 1;
    
    // Then sort by preference
    switch (tripInfo.preference) {
      case 'price':
        return parseFloat(String(a.price)) - parseFloat(String(b.price));
      case 'speed':
        return (a.eta || 0) - (b.eta || 0);
      case 'luxury':
        // For luxury, prioritize high luxury level (4-5) cars, then by lowest price
        const aIsLuxury = (a.luxuryLevel || 0) >= 4;
        const bIsLuxury = (b.luxuryLevel || 0) >= 4;
        
        if (aIsLuxury && !bIsLuxury) return -1;
        if (!aIsLuxury && bIsLuxury) return 1;
        if (aIsLuxury && bIsLuxury) {
          // Both are luxury, sort by price
          return parseFloat(String(a.price)) - parseFloat(String(b.price));
        }
        // Neither is luxury, sort by luxury level
        return (b.luxuryLevel || 0) - (a.luxuryLevel || 0);
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

      {/* Preference indicator and savings */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Sorted by {tripInfo.preference === 'speed' ? 'fastest pickup' : tripInfo.preference === 'luxury' ? 'luxury level' : 'best price'}
            </span>
          </div>
          {potentialSavings > 0 && (
            <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
              <span className="text-xs font-medium text-green-700">
                Save ${potentialSavings.toFixed(2)}
                {minutesSaved > 0 && ` • ${minutesSaved} min`}
              </span>
            </div>
          )}
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
      
      {/* Additional booking help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
        <p className="text-xs text-gray-600 text-center">
          💡 Tap any ride to see details and book directly with the app
        </p>
      </div>
    </section>
  );
}
