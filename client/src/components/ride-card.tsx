import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import RideModal from "./ride-modal";
import type { Ride } from "@shared/schema";

interface RideCardProps {
  ride: Ride;
  isRecommended?: boolean;
}

export default function RideCard({ ride, isRecommended = false }: RideCardProps) {
  const [showModal, setShowModal] = useState(false);

  const isLuxury = ride.luxuryLevel >= 4;

  return (
    <>
      <div 
        className={`ride-card bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all relative ${
          isRecommended 
            ? "border-2 border-green-500 shadow-md" 
            : "border border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">{ride.icon}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">{ride.name}</h4>
                {isRecommended && (
                  <Badge className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    RECOMMENDED
                  </Badge>
                )}
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
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{ride.eta} min</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">${ride.price}</div>
            <div className="text-sm text-gray-500">Est. total</div>
          </div>
        </div>
      </div>

      <RideModal 
        ride={ride} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
