import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { compareRidesSchema, insertRideRequestSchema } from "@shared/schema";
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
          recommendedRide = ridesWithVariations.reduce((prev, current) => 
            prev.luxuryLevel > current.luxuryLevel ? prev : current
          );
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

  const httpServer = createServer(app);
  return httpServer;
}
