import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import type { AddressSuggestion } from "@shared/schema";

interface AddressInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showGpsButton?: boolean;
  onGpsClick?: () => void;
  isLoadingGps?: boolean;
  icon?: "pickup" | "destination";
}

export default function AddressInput({
  label,
  placeholder,
  value,
  onChange,
  showGpsButton = false,
  onGpsClick,
  isLoadingGps = false,
  icon = "destination"
}: AddressInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["/api/addresses/search", query],
    queryFn: () => api.searchAddresses(query),
    enabled: query.length >= 2 && isOpen,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);
    setIsOpen(newValue.length >= 2);
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.description);
    onChange(suggestion.description);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <Label htmlFor={label} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className={`w-3 h-3 rounded-full ${
            icon === "pickup" ? "bg-primary" : "bg-red-500"
          }`}></div>
        </div>
        <Input
          ref={inputRef}
          id={label}
          type="text"
          className={`pl-10 py-3 ${showGpsButton ? "pr-12" : "pr-3"}`}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          autoComplete="off"
        />
        {showGpsButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0"
            onClick={onGpsClick}
            disabled={isLoadingGps}
          >
            <Navigation className="w-5 h-5 text-gray-400 hover:text-primary" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="address-dropdown absolute z-50 w-full mt-1 bg-white rounded-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500">Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="address-suggestion w-full text-left p-3 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.mainText}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.secondaryText}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="p-3 text-sm text-gray-500">No addresses found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}