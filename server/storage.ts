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

  async getSavingsAnalytics(period: '3D' | '1W' | '3M' | '6M' | '1Y' | 'ALL'): Promise<{
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
      totalSavings: "20.00",
      totalTimeSaved: 89
    };

    await db.insert(users).values(mockUser);
    
    // Add historical ride requests with realistic savings over different time periods
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
    const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));

    const mockRideHistory: InsertRideRequest[] = [
      // Recent rides (last 3 months)
      {
        fromLocation: "Golden Gate Park, San Francisco, CA",
        toLocation: "San Francisco International Airport (SFO)",
        preference: "price",
        selectedRideId: 2,
        recommendedRideId: 2,
        potentialSavings: "4.50",
        savingsType: "price",
        timeSavedMinutes: 0,
        createdAt: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString()
      },
      {
        fromLocation: "456 Market Street, San Francisco, CA",
        toLocation: "Fisherman's Wharf, San Francisco, CA",
        preference: "speed",
        selectedRideId: 1,
        recommendedRideId: 1,
        potentialSavings: "3.75",
        savingsType: "time",
        timeSavedMinutes: 5, // 5 minutes faster pickup
        createdAt: new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)).toISOString()
      },
      // 6 month old rides
      {
        fromLocation: "123 Main Street, San Francisco, CA",
        toLocation: "Union Square, San Francisco, CA",
        preference: "luxury",
        selectedRideId: 8,
        recommendedRideId: 8,
        potentialSavings: "8.00",
        savingsType: "luxury",
        timeSavedMinutes: 0,
        createdAt: new Date(sixMonthsAgo.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString()
      },
      {
        fromLocation: "Lombard Street, San Francisco, CA",
        toLocation: "101 California Street, San Francisco, CA",
        preference: "price",
        selectedRideId: 4,
        recommendedRideId: 4,
        potentialSavings: "3.25",
        savingsType: "price",
        timeSavedMinutes: 0,
        createdAt: new Date(sixMonthsAgo.getTime() + (45 * 24 * 60 * 60 * 1000)).toISOString()
      },
      // Older rides (1 year)
      {
        fromLocation: "Mission District, San Francisco, CA",
        toLocation: "Castro District, San Francisco, CA",
        preference: "speed",
        selectedRideId: 3,
        recommendedRideId: 3,
        potentialSavings: "2.25",
        savingsType: "time",
        timeSavedMinutes: 3, // 3 minutes faster
        createdAt: new Date(oneYearAgo.getTime() + (60 * 24 * 60 * 60 * 1000)).toISOString()
      }
    ];

    await db.insert(rideRequests).values(mockRideHistory);
  }
}

export const storage = new DatabaseStorage();
