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
    
    // Update user totals when ride request is created
    await this.updateUserTotals(rideRequest);
    
    return rideRequest;
  }

  private async updateUserTotals(rideRequest: RideRequest): Promise<void> {
    const user = await this.getUserProfile();
    if (!user) return;

    const savings = parseFloat(rideRequest.potentialSavings || '0');
    const timeSaved = rideRequest.timeSavedMinutes || 0;
    
    // Update user totals
    await db.update(users)
      .set({
        totalRides: user.totalRides + 1,
        totalSavings: (parseFloat(user.totalSavings || '0') + savings).toFixed(2),
        totalTimeSaved: (user.totalTimeSaved || 0) + timeSaved,
      })
      .where(eq(users.id, user.id));
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

    const sampleRides: InsertRide[] = [
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

    await db.insert(rides).values(sampleRides);
  }

  async getUserProfile(): Promise<User | undefined> {
    const [user] = await db.select().from(users).limit(1);
    return user || undefined;
  }

  async getRideHistory(): Promise<RideRequest[]> {
    return await db.select().from(rideRequests).orderBy(sql`created_at DESC`).limit(20);
  }

  async getSavingsAnalytics(period: '1W' | '3M' | '6M' | '1Y' | 'ALL'): Promise<{
    totalSavings: number;
    priceSavings: number;
    timeSavings: number;
    luxurySavings: number;
    totalMinutesSaved: number;
    rideCount: number;
  }> {
    let dateFilter = '';
    
    switch (period) {
      case '3M':
        dateFilter = `AND created_at >= datetime('now', '-3 months')`;
        break;
      case '6M':
        dateFilter = `AND created_at >= datetime('now', '-6 months')`;
        break;
      case '1Y':
        dateFilter = `AND created_at >= datetime('now', '-1 year')`;
        break;
      case 'ALL':
      default:
        dateFilter = '';
        break;
    }

    const rides = await db.select().from(rideRequests).where(
      period === 'ALL' ? undefined : sql`created_at >= ${new Date(
        Date.now() - (period === '3M' ? 90 : period === '6M' ? 180 : 365) * 24 * 60 * 60 * 1000
      ).toISOString()}`
    );

    const analytics = rides.reduce((acc, ride) => {
      const savings = parseFloat(ride.potentialSavings || '0');
      const timeMinutes = ride.timeSavedMinutes || 0;
      
      // Add all monetary savings to total
      if (ride.savingsType === 'price' || ride.savingsType === 'luxury') {
        acc.totalSavings += savings;
      }
      acc.rideCount += 1;
      acc.totalMinutesSaved += timeMinutes;
      
      switch (ride.savingsType) {
        case 'price':
          acc.priceSavings += savings;
          break;
        case 'luxury':
          acc.luxurySavings += savings;
          break;
        // Removed time value savings as monetary value is subjective
      }
      
      return acc;
    }, {
      totalSavings: 0,
      priceSavings: 0,
      luxurySavings: 0,
      totalMinutesSaved: 0,
      rideCount: 0
    });

    // Add cumulative savings data points for chart
    const cumulativeData = rides
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .reduce((acc, ride, index) => {
        const savings = parseFloat(ride.potentialSavings || '0');
        const previousTotal = index === 0 ? 0 : acc[index - 1].total;
        
        // Count monetary savings for cumulative chart
        const monetarySavings = (ride.savingsType === 'price' || ride.savingsType === 'luxury') ? savings : 0;
        
        acc.push({
          date: ride.createdAt,
          total: previousTotal + monetarySavings,
          ride: `${ride.fromLocation} → ${ride.toLocation}`,
        });
        return acc;
      }, [] as Array<{ date: string; total: number; ride: string }>);

    return {
      ...analytics,
      cumulativeData,
    };
  }

  async seedUser(): Promise<void> {
    // No user seeding for production deployment
    return Promise.resolve();
  }
}

export const storage = new DatabaseStorage();
