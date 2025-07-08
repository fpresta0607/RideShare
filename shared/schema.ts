import { pgTable, text, serial, decimal, integer } from "drizzle-orm/pg-core";
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
});

export const insertRideSchema = createInsertSchema(rides).omit({ id: true });
export const insertRideRequestSchema = createInsertSchema(rideRequests).omit({ id: true });

export const compareRidesSchema = z.object({
  fromLocation: z.string().min(1, "Origin location is required"),
  toLocation: z.string().min(1, "Destination is required"),
  preference: z.enum(["price", "speed", "luxury"]).default("price"),
});

export type Ride = typeof rides.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type RideRequest = typeof rideRequests.$inferSelect;
export type InsertRideRequest = z.infer<typeof insertRideRequestSchema>;
export type CompareRidesRequest = z.infer<typeof compareRidesSchema>;
