import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// GTGOTG Application Tables

/**
 * Restroom locations across the USA
 * Contains 313,590 locations from comprehensive dataset
 */
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 255 }).notNull().unique(), // Original ID from dataset
  name: text("name").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Rest Area, Gas Station/Fuel, Restaurant/Food, Bar/Pub/Tavern, Public Building, Park/Recreation
  subcategory: varchar("subcategory", { length: 100 }),
  latitude: varchar("latitude", { length: 20 }).notNull(), // Store as string to preserve precision
  longitude: varchar("longitude", { length: 20 }).notNull(),
  street: text("street"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 2 }), // US state code
  postcode: varchar("postcode", { length: 20 }),
  phone: varchar("phone", { length: 50 }),
  website: text("website"),
  brand: varchar("brand", { length: 255 }),
  hasRestroom: int("hasRestroom").notNull().default(1), // 1 = true, 0 = false
  restroomType: mysqlEnum("restroomType", ["public", "customer"]).notNull(),
  restroomConfidence: varchar("restroomConfidence", { length: 10 }), // 0.0 to 1.0
  source: varchar("source", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

/**
 * User reviews for restroom locations
 * Includes cleanliness, ADA compliance, and safety ratings
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  userId: int("userId").notNull(),
  // Rating criteria (1-5 scale)
  cleanlinessRating: int("cleanlinessRating").notNull(), // 1-5
  adaComplianceRating: int("adaComplianceRating"), // 1-5, nullable if not applicable
  safetyRating: int("safetyRating").notNull(), // 1-5
  // Restroom type used
  restroomTypeUsed: mysqlEnum("restroomTypeUsed", ["male", "female", "unisex_family"]).notNull(),
  usedAdaStall: int("usedAdaStall").notNull().default(0), // 1 = true, 0 = false
  // Review content
  comment: text("comment"),
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Business owner verifications and replies
 */
export const ownerVerifications = mysqlTable("ownerVerifications", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull().unique(),
  userId: int("userId").notNull(), // User who verified ownership
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).notNull().default("pending"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OwnerVerification = typeof ownerVerifications.$inferSelect;
export type InsertOwnerVerification = typeof ownerVerifications.$inferInsert;

/**
 * Owner replies to reviews
 */
export const ownerReplies = mysqlTable("ownerReplies", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("reviewId").notNull(),
  userId: int("userId").notNull(), // Must be verified owner
  reply: text("reply").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OwnerReply = typeof ownerReplies.$inferSelect;
export type InsertOwnerReply = typeof ownerReplies.$inferInsert;

/**
 * User badges for gamification
 * Awarded for every 5 different bathrooms rated
 */
export const userBadges = mysqlTable("userBadges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeType: mysqlEnum("badgeType", ["reviewer", "bronze", "silver", "gold", "platinum", "expert"]).notNull(),
  reviewCount: int("reviewCount").notNull(), // Number of reviews when badge was earned
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;