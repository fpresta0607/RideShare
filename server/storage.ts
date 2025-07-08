import { rides, rideRequests, type Ride, type InsertRide, type RideRequest, type InsertRideRequest } from "@shared/schema";

export interface IStorage {
  getRides(): Promise<Ride[]>;
  createRideRequest(request: InsertRideRequest): Promise<RideRequest>;
  getRideById(id: number): Promise<Ride | undefined>;
}

export class MemStorage implements IStorage {
  private rides: Map<number, Ride>;
  private rideRequests: Map<number, RideRequest>;
  private currentRideId: number;
  private currentRequestId: number;

  constructor() {
    this.rides = new Map();
    this.rideRequests = new Map();
    this.currentRideId = 1;
    this.currentRequestId = 1;
    this.seedRides();
  }

  private seedRides() {
    const mockRides: Omit<Ride, 'id'>[] = [
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

    mockRides.forEach((ride) => {
      const id = this.currentRideId++;
      this.rides.set(id, { ...ride, id });
    });
  }

  async getRides(): Promise<Ride[]> {
    return Array.from(this.rides.values());
  }

  async createRideRequest(request: InsertRideRequest): Promise<RideRequest> {
    const id = this.currentRequestId++;
    const rideRequest: RideRequest = { ...request, id };
    this.rideRequests.set(id, rideRequest);
    return rideRequest;
  }

  async getRideById(id: number): Promise<Ride | undefined> {
    return this.rides.get(id);
  }
}

export const storage = new MemStorage();
