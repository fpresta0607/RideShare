import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CompareRidesRequest } from "@shared/schema";

interface LocationInputProps {
  onSearch: (data: CompareRidesRequest) => void;
}

export default function LocationInput({ onSearch }: LocationInputProps) {
  const [fromLocation, setFromLocation] = useState("123 Main St, San Francisco, CA");
  const [toLocation, setToLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          setFromLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setIsLoading(false);
          toast({
            title: "Location updated",
            description: "Current location has been set",
          });
        },
        (error) => {
          setIsLoading(false);
          toast({
            title: "Location error",
            description: "Unable to get your current location",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromLocation.trim()) {
      toast({
        title: "Origin required",
        description: "Please enter a pickup location",
        variant: "destructive",
      });
      return;
    }

    if (!toLocation.trim()) {
      toast({
        title: "Destination required",
        description: "Please enter a destination",
        variant: "destructive",
      });
      return;
    }

    onSearch({
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      preference: "price"
    });
  };

  return (
    <section className="bg-white shadow-sm p-4 border-b border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Location */}
        <div className="relative">
          <Label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-2">
            From
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
            </div>
            <Input
              id="from"
              type="text"
              className="pl-10 pr-12 py-3"
              placeholder="Current location"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0"
              onClick={handleGetCurrentLocation}
              disabled={isLoading}
            >
              <Navigation className="w-5 h-5 text-gray-400 hover:text-primary" />
            </Button>
          </div>
        </div>

        {/* Destination */}
        <div className="relative">
          <Label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
            To
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <Input
              id="to"
              type="text"
              className="pl-10 pr-3 py-3"
              placeholder="Where to?"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Search Button */}
        <Button 
          type="submit"
          className="w-full py-3 font-medium"
          disabled={isLoading}
        >
          Compare Rides
        </Button>
      </form>
    </section>
  );
}
