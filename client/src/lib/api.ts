import { apiRequest } from "./queryClient";
import type { CompareRidesRequest, AddressSuggestion } from "@shared/schema";

export const api = {
  compareRides: async (data: CompareRidesRequest) => {
    const response = await apiRequest("POST", "/api/rides/compare", data);
    return response.json();
  },

  getRides: async () => {
    const response = await apiRequest("GET", "/api/rides");
    return response.json();
  },

  getRide: async (id: number) => {
    const response = await apiRequest("GET", `/api/rides/${id}`);
    return response.json();
  },

  searchAddresses: async (query: string): Promise<AddressSuggestion[]> => {
    const response = await apiRequest("GET", `/api/addresses/search?q=${encodeURIComponent(query)}`);
    return response.json();
  }
};
