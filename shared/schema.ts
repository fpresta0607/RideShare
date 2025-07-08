import { pgTable, text, serial, decimal, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(), // 'uber' or 'lyft'
  rideType: text("ride_type").notNull(), // 'UberX', 'Lyft', etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  eta: integer("eta").notNull(), // in minutes
  luxuryLevel: integer("luxury_level").notNull(), // 1-5 scale
  seats: integer("seats").notNull(),
  icon: text("icon").notNull(), // emoji or icon identifier
});

export const rideRequests = pgTable("ride_requests", {
  id: serial("id").primaryKey(),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  preference: text("preference").notNull(), // 'price', 'speed', 'luxury'
  selectedRideId: integer("selected_ride_id"),
  recommendedRideId: integer("recommended_ride_id"),
  potentialSavings: text("potential_savings").default("0.00"),
  savingsType: text("savings_type"), // 'price', 'time', 'luxury'
  timeSavedMinutes: integer("time_saved_minutes").default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  preferredPayment: text("preferred_payment").default("card"),
  totalRides: integer("total_rides").default(0),
  totalSpent: text("total_spent").default("0.00"),
  totalSavings: text("total_savings").default("0.00"),
  memberSince: text("member_since").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertRideSchema = createInsertSchema(rides).omit({ id: true });
export const insertRideRequestSchema = createInsertSchema(rideRequests).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, memberSince: true });

export const compareRidesSchema = z.object({
  fromLocation: z.string().min(1, "Origin location is required"),
  toLocation: z.string().min(1, "Destination is required"),
  preference: z.enum(["price", "speed", "luxury"]).default("price"),
});

// Address suggestion schema for autocomplete
export const addressSuggestionSchema = z.object({
  id: z.string(),
  description: z.string(),
  mainText: z.string(),
  secondaryText: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type Ride = typeof rides.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type RideRequest = typeof rideRequests.$inferSelect;
export type InsertRideRequest = z.infer<typeof insertRideRequestSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CompareRidesRequest = z.infer<typeof compareRidesSchema>;
export type AddressSuggestion = z.infer<typeof addressSuggestionSchema>;
