import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { compareRidesSchema, insertRideRequestSchema, type AddressSuggestion } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all available rides
  app.get("/api/rides", async (req, res) => {
    try {
      const rides = await storage.getRides();
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rides" });
    }
  });

  // Compare rides between origin and destination
  app.post("/api/rides/compare", async (req, res) => {
    try {
      const validation = compareRidesSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request data",
          details: validation.error.issues 
        });
      }

      const { fromLocation, toLocation, preference } = validation.data;

      // Create ride request record
      const rideRequest = await storage.createRideRequest({
        fromLocation,
        toLocation,
        preference
      });

      // Get all rides and apply realistic variations
      const allRides = await storage.getRides();
      
      // Apply distance and demand variations to pricing and timing
      const ridesWithVariations = allRides.map(ride => {
        // Simulate price variations based on distance and demand (+/- 20%)
        const basePrice = parseFloat(ride.price);
        const priceVariation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2 multiplier
        const adjustedPrice = (basePrice * priceVariation).toFixed(2);

        // Simulate ETA variations based on traffic (+/- 3 minutes)
        const etaVariation = Math.floor(Math.random() * 7) - 3; // -3 to +3 minutes
        const adjustedEta = Math.max(1, ride.eta + etaVariation);

        return {
          ...ride,
          price: adjustedPrice,
          eta: adjustedEta
        };
      });

      // Calculate recommendation based on preference
      let recommendedRide;
      switch (preference) {
        case 'price':
          recommendedRide = ridesWithVariations.reduce((prev, current) => 
            parseFloat(prev.price) < parseFloat(current.price) ? prev : current
          );
          break;
        case 'speed':
          recommendedRide = ridesWithVariations.reduce((prev, current) => 
            prev.eta < current.eta ? prev : current
          );
          break;
        case 'luxury':
          // For luxury, prioritize high luxury level (4-5) cars, then by lowest price
          const luxuryRides = ridesWithVariations.filter(ride => ride.luxuryLevel >= 4);
          if (luxuryRides.length > 0) {
            recommendedRide = luxuryRides.reduce((prev, current) => 
              parseFloat(prev.price) < parseFloat(current.price) ? prev : current
            );
          } else {
            // Fallback to highest luxury level if no luxury cars available
            recommendedRide = ridesWithVariations.reduce((prev, current) => 
              prev.luxuryLevel > current.luxuryLevel ? prev : current
            );
          }
          break;
        default:
          recommendedRide = ridesWithVariations[0];
      }

      res.json({
        rides: ridesWithVariations,
        recommendedRide,
        tripInfo: {
          fromLocation,
          toLocation,
          estimatedDuration: "12 min", // This would be calculated from a mapping service
          preference
        }
      });

    } catch (error) {
      res.status(500).json({ error: "Failed to compare rides" });
    }
  });

  // Get specific ride details
  app.get("/api/rides/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ride ID" });
      }

      const ride = await storage.getRideById(id);
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }

      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ride details" });
    }
  });

  // Address autocomplete endpoint
  app.get("/api/addresses/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      // Mock address suggestions - in production, this would use Google Places API or Mapbox
      const mockAddresses: AddressSuggestion[] = [
        {
          id: "1",
          description: "123 Main Street, San Francisco, CA, USA",
          mainText: "123 Main Street",
          secondaryText: "San Francisco, CA, USA",
          lat: 37.7749,
          lng: -122.4194
        },
        {
          id: "2", 
          description: "456 Market Street, San Francisco, CA, USA",
          mainText: "456 Market Street",
          secondaryText: "San Francisco, CA, USA",
          lat: 37.7849,
          lng: -122.4094
        },
        {
          id: "3",
          description: "789 Union Square, San Francisco, CA, USA", 
          mainText: "789 Union Square",
          secondaryText: "San Francisco, CA, USA",
          lat: 37.7880,
          lng: -122.4074
        },
        {
          id: "4",
          description: "101 California Street, San Francisco, CA, USA",
          mainText: "101 California Street", 
          secondaryText: "San Francisco, CA, USA",
          lat: 37.7929,
          lng: -122.3977
        },
        {
          id: "5",
          description: "San Francisco International Airport (SFO), San Francisco, CA, USA",
          mainText: "San Francisco International Airport",
          secondaryText: "SFO, San Francisco, CA, USA",
          lat: 37.6213,
          lng: -122.3790
        },
        {
          id: "6",
          description: "Golden Gate Park, San Francisco, CA, USA",
          mainText: "Golden Gate Park",
          secondaryText: "San Francisco, CA, USA", 
          lat: 37.7694,
          lng: -122.4862
        },
        {
          id: "7",
          description: "Fisherman's Wharf, San Francisco, CA, USA",
          mainText: "Fisherman's Wharf",
          secondaryText: "San Francisco, CA, USA",
          lat: 37.8080,
          lng: -122.4177
        },
        {
          id: "8",
          description: "Lombard Street, San Francisco, CA, USA",
          mainText: "Lombard Street", 
          secondaryText: "San Francisco, CA, USA",
          lat: 37.8022,
          lng: -122.4197
        }
      ];

      // Filter based on query
      const filtered = mockAddresses.filter(addr => 
        addr.description.toLowerCase().includes(query.toLowerCase()) ||
        addr.mainText.toLowerCase().includes(query.toLowerCase())
      );

      res.json(filtered.slice(0, 5)); // Return top 5 matches
    } catch (error) {
      res.status(500).json({ error: "Failed to search addresses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
