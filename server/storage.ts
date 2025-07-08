import { rides, rideRequests, type Ride, type InsertRide, type RideRequest, type InsertRideRequest } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getRides(): Promise<Ride[]>;
  createRideRequest(request: InsertRideRequest): Promise<RideRequest>;
  getRideById(id: number): Promise<Ride | undefined>;
  seedRides(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getRides(): Promise<Ride[]> {
    return await db.select().from(rides);
  }

  async createRideRequest(request: InsertRideRequest): Promise<RideRequest> {
    const [rideRequest] = await db
      .insert(rideRequests)
      .values(request)
      .returning();
    return rideRequest;
  }

  async getRideById(id: number): Promise<Ride | undefined> {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride || undefined;
  }

  async seedRides(): Promise<void> {
    // Check if rides already exist
    const existingRides = await db.select().from(rides);
    if (existingRides.length > 0) {
      return; // Already seeded
    }

    const mockRides: InsertRide[] = [
      // Uber rides
      {
        service: "uber",
        rideType: "UberX",
        name: "UberX",
        description: "Affordable, everyday rides",
        price: "12.50",
        eta: 3,
        luxuryLevel: 1,
        seats: 4,
        icon: "🚗"
      },
      {
        service: "uber",
        rideType: "UberXL",
        name: "UberXL",
        description: "Larger vehicles for groups",
        price: "18.75",
        eta: 5,
        luxuryLevel: 2,
        seats: 6,
        icon: "🚐"
      },
      {
        service: "uber",
        rideType: "UberBlack",
        name: "Uber Black",
        description: "Premium rides in luxury cars",
        price: "32.00",
        eta: 4,
        luxuryLevel: 5,
        seats: 4,
        icon: "🖤"
      },
      // Lyft rides
      {
        service: "lyft",
        rideType: "Lyft",
        name: "Lyft",
        description: "Affordable, reliable rides",
        price: "13.25",
        eta: 2,
        luxuryLevel: 1,
        seats: 4,
        icon: "🚗"
      },
      {
        service: "lyft",
        rideType: "LyftXL",
        name: "Lyft XL",
        description: "Extra room for your group",
        price: "19.50",
        eta: 6,
        luxuryLevel: 2,
        seats: 6,
        icon: "🚐"
      },
      {
        service: "lyft",
        rideType: "LyftLux",
        name: "Lyft Lux",
        description: "High-end cars with top drivers",
        price: "28.75",
        eta: 7,
        luxuryLevel: 5,
        seats: 4,
        icon: "💎"
      }
    ];

    await db.insert(rides).values(mockRides);
  }
}

export const storage = new DatabaseStorage();
