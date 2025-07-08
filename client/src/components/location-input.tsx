import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AddressInput from "./address-input";
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
        {/* Current Location with GPS and Autocomplete */}
        <AddressInput
          label="From"
          placeholder="Current location"
          value={fromLocation}
          onChange={setFromLocation}
          showGpsButton={true}
          onGpsClick={handleGetCurrentLocation}
          isLoadingGps={isLoading}
          icon="pickup"
        />

        {/* Destination with Autocomplete */}
        <AddressInput
          label="To"
          placeholder="Where to?"
          value={toLocation}
          onChange={setToLocation}
          icon="destination"
        />

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
