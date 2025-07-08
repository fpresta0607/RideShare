import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationInput from "@/components/location-input";
import PreferenceSelector from "@/components/preference-selector";
import RideComparison from "@/components/ride-comparison";
import type { CompareRidesRequest } from "@shared/schema";

export default function Home() {
  const [searchData, setSearchData] = useState<CompareRidesRequest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (data: CompareRidesRequest) => {
    setSearchData(data);
    setHasSearched(true);
  };

  const handlePreferenceChange = (preference: "price" | "speed" | "luxury") => {
    if (searchData) {
      setSearchData({ ...searchData, preference });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">RideCompare</h1>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-6 h-6 text-gray-600" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Location Input Section */}
        <LocationInput onSearch={handleSearch} />

        {/* Preference Selector - only show after search */}
        {hasSearched && searchData && (
          <PreferenceSelector 
            selectedPreference={searchData.preference}
            onPreferenceChange={handlePreferenceChange}
          />
        )}

        {/* Ride Comparison Results */}
        {searchData && (
          <RideComparison searchData={searchData} />
        )}
      </main>
    </div>
  );
}
