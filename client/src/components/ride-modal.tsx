import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Ride } from "@shared/schema";

interface RideModalProps {
  ride: Ride;
  isOpen: boolean;
  onClose: () => void;
}

export default function RideModal({ ride, isOpen, onClose }: RideModalProps) {
  const { toast } = useToast();

  const handleOpenApp = () => {
    // Generate deep link URLs with ride parameters
    const baseUrls = {
      uber: "https://m.uber.com/ul/",
      lyft: "https://lyft.com/ride"
    };

    const fallbackUrls = {
      uber: "https://apps.apple.com/app/uber/id368677368",
      lyft: "https://apps.apple.com/app/lyft/id529379082"
    };

    const deepLinkUrls = {
      uber: "uber://",
      lyft: "lyft://ridetype?id=lyft"
    };

    const platform = ride.service.toLowerCase() as 'uber' | 'lyft';
    
    // Try deep link first, then fallback to web, then app store
    const tryOpenApp = () => {
      // Try deep link
      window.location.href = deepLinkUrls[platform];
      
      // If deep link fails, try web version after a delay
      setTimeout(() => {
        window.open(baseUrls[platform], '_blank');
      }, 1000);
    };

    tryOpenApp();
    
    toast({
      title: `Opening ${ride.service}...`,
      description: `Redirecting to complete your ${ride.name} booking`,
    });
    
    onClose();
  };

  const isLuxury = ride.luxuryLevel >= 4;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Confirm Your Ride</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">{ride.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{ride.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {ride.seats} seats
                  </Badge>
                  {isLuxury && (
                    <Badge className="bg-amber-100 text-amber-700 text-xs">
                      Luxury
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{ride.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">${ride.price}</div>
                <div className="text-sm text-gray-500">Est. total</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pickup time</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{ride.eta} min</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Trip duration</span>
              <span className="font-medium">~12 min</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Service</span>
              <span className="font-medium capitalize">{ride.service}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full py-4 text-lg font-medium"
              onClick={handleOpenApp}
            >
              Book with {ride.service === "uber" ? "Uber" : "Lyft"}
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              Back to Options
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 text-center">
              🚗 You'll be redirected to the {ride.service === "uber" ? "Uber" : "Lyft"} app to complete your booking
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
