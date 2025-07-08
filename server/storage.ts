import { rides, rideRequests, users, type Ride, type InsertRide, type RideRequest, type InsertRideRequest, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getRides(): Promise<Ride[]>;
  createRideRequest(request: InsertRideRequest): Promise<RideRequest>;
  getRideById(id: number): Promise<Ride | undefined>;
  seedRides(): Promise<void>;
  getUserProfile(): Promise<User | undefined>;
  getRideHistory(): Promise<RideRequest[]>;
  seedUser(): Promise<void>;
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

  async getUserProfile(): Promise<User | undefined> {
    const [user] = await db.select().from(users).limit(1);
    return user || undefined;
  }

  async getRideHistory(): Promise<RideRequest[]> {
    return await db.select().from(rideRequests).orderBy(sql`created_at DESC`).limit(20);
  }

  async seedUser(): Promise<void> {
    // Check if user already exists
    const existingUser = await db.select().from(users).limit(1);
    if (existingUser.length > 0) {
      return; // Already seeded
    }

    const mockUser: InsertUser = {
      name: "Alex Chen",
      email: "alex.chen@email.com",
      phoneNumber: "+1 (555) 123-4567",
      preferredPayment: "card",
      totalRides: 47,
      totalSpent: "892.45",
      totalSavings: "3247.80"
    };

    await db.insert(users).values(mockUser);
    
    // Add some historical ride requests
    const mockRideHistory: InsertRideRequest[] = [
      {
        fromLocation: "Golden Gate Park, San Francisco, CA",
        toLocation: "San Francisco International Airport (SFO)",
        preference: "price"
      },
      {
        fromLocation: "456 Market Street, San Francisco, CA",
        toLocation: "Fisherman's Wharf, San Francisco, CA",
        preference: "speed"
      },
      {
        fromLocation: "123 Main Street, San Francisco, CA",
        toLocation: "Union Square, San Francisco, CA",
        preference: "luxury"
      },
      {
        fromLocation: "Lombard Street, San Francisco, CA",
        toLocation: "101 California Street, San Francisco, CA",
        preference: "price"
      },
      {
        fromLocation: "Mission District, San Francisco, CA",
        toLocation: "Castro District, San Francisco, CA",
        preference: "speed"
      }
    ];

    await db.insert(rideRequests).values(mockRideHistory);
  }
}

export const storage = new DatabaseStorage();
