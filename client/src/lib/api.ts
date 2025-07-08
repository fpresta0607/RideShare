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
  },

  getUserProfile: async () => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      const userData = JSON.parse(demoUser);
      // Ensure email and phone are updated
      userData.email = 'fpresta0607@gmail.com';
      userData.phoneNumber = '+1 (630) 674-9978';
      return Promise.resolve(userData);
    }
    
    const response = await apiRequest("GET", "/api/user/profile");
    return response.json();
  },

  getRideHistory: async () => {
    // Return demo data for demo users
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      return Promise.resolve([
        {
          id: 1,
          fromLocation: "Union Square",
          toLocation: "SFO Airport",
          preference: "price",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 2,
          fromLocation: "Mission District", 
          toLocation: "Financial District",
          preference: "speed",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 3,
          fromLocation: "Castro",
          toLocation: "Nob Hill", 
          preference: "luxury",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: 4,
          fromLocation: "Marina District",
          toLocation: "SOMA",
          preference: "price",
          createdAt: new Date(Date.now() - 345600000).toISOString(),
        },
        {
          id: 5,
          fromLocation: "Hayes Valley",
          toLocation: "Oakland Airport",
          preference: "speed",
          createdAt: new Date(Date.now() - 432000000).toISOString(),
        },
        {
          id: 6,
          fromLocation: "Financial District",
          toLocation: "Presidio",
          preference: "luxury",
          createdAt: new Date(Date.now() - 518400000).toISOString(),
        },
        {
          id: 7,
          fromLocation: "Chinatown",
          toLocation: "Golden Gate Park",
          preference: "price",
          createdAt: new Date(Date.now() - 604800000).toISOString(),
        },
        {
          id: 8,
          fromLocation: "Richmond",
          toLocation: "Downtown",
          preference: "speed",
          createdAt: new Date(Date.now() - 1209600000).toISOString(),
        }
      ]);
    }
    
    const response = await apiRequest("GET", "/api/user/ride-history");
    return response.json();
  },

  getSavingsAnalytics: async (period: '1W' | '3M' | '6M' | '1Y' | 'ALL' = 'ALL') => {
    // Return demo analytics for demo users
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      return {
        totalSavings: 47.85,
        priceSavings: 32.40,
        luxurySavings: 15.45,
        totalMinutesSaved: 78,
        rideCount: 15,
        cumulativeData: []
      };
    }
    
    const response = await apiRequest("GET", `/api/user/savings-analytics?period=${period}`);
    return response.json();
  }
};
