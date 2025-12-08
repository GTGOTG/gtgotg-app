import { and, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, locations, reviews, userBadges, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Location queries

/**
 * Get locations within a bounding box (viewport)
 * Optimized for map viewport queries
 */
export async function getLocationsInBounds(params: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  categories?: string[];
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const { minLat, maxLat, minLng, maxLng, categories, limit = 10000 } = params;

  let query = db
    .select()
    .from(locations)
    .where(
      and(
        sql`CAST(${locations.latitude} AS DECIMAL(10,7)) BETWEEN ${minLat} AND ${maxLat}`,
        sql`CAST(${locations.longitude} AS DECIMAL(10,7)) BETWEEN ${minLng} AND ${maxLng}`
      )
    )
    .limit(limit);

  if (categories && categories.length > 0) {
    return await db
      .select()
      .from(locations)
      .where(
        and(
          sql`CAST(${locations.latitude} AS DECIMAL(10,7)) BETWEEN ${minLat} AND ${maxLat}`,
          sql`CAST(${locations.longitude} AS DECIMAL(10,7)) BETWEEN ${minLng} AND ${maxLng}`,
          inArray(locations.category, categories)
        )
      )
      .limit(limit);
  }

  return await query;
}

/**
 * Get locations by state
 */
export async function getLocationsByState(state: string, limit = 10000) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(locations)
    .where(eq(locations.state, state.toUpperCase()))
    .limit(limit);
}

/**
 * Get a single location by ID
 */
export async function getLocationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(locations)
    .where(eq(locations.id, id))
    .limit(1);

  return result[0];
}

/**
 * Get reviews for a location
 */
export async function getLocationReviews(locationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.locationId, locationId));
}

/**
 * Create a review
 */
export async function createReview(review: typeof reviews.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(reviews).values(review);
  
  // Check if user earned a badge
  const userReviewCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviews)
    .where(eq(reviews.userId, review.userId));

  const count = Number(userReviewCount[0]?.count || 0);
  
  // Award badge every 5 reviews
  if (count % 5 === 0 && count > 0) {
    const badgeTypes = ["reviewer", "bronze", "silver", "gold", "platinum", "expert"] as const;
    const badgeIndex = Math.min(Math.floor(count / 5) - 1, badgeTypes.length - 1);
    
    await db.insert(userBadges).values({
      userId: review.userId,
      badgeType: badgeTypes[badgeIndex],
      reviewCount: count,
    });
  }
}

/**
 * Get user's badges
 */
export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId));
}

/**
 * Get pending business claims for admin review
 */
export async function getPendingBusinessClaims() {
  const db = await getDb();
  if (!db) return [];

  const { businessClaims } = await import('../drizzle/schema');
  const { users } = await import('../drizzle/schema');
  
  const claims = await db
    .select({
      id: businessClaims.id,
      userId: businessClaims.userId,
      locationId: businessClaims.locationId,
      status: businessClaims.status,
      verificationDocumentUrl: businessClaims.verificationDocumentUrl,
      notes: businessClaims.notes,
      createdAt: businessClaims.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(businessClaims)
    .leftJoin(users, eq(businessClaims.userId, users.id))
    .where(eq(businessClaims.status, "pending"));

  return claims;
}

/**
 * Approve a business claim
 */
export async function approveBusinessClaim(claimId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { businessClaims } = await import('../drizzle/schema');
  
  await db
    .update(businessClaims)
    .set({ status: "approved" })
    .where(eq(businessClaims.id, claimId));
}

/**
 * Reject a business claim
 */
export async function rejectBusinessClaim(claimId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { businessClaims } = await import('../drizzle/schema');
  
  await db
    .update(businessClaims)
    .set({ status: "rejected" })
    .where(eq(businessClaims.id, claimId));
}

/**
 * Submit a business claim for verification
 */
export async function submitBusinessClaim(data: {
  userId: number;
  locationId: number;
  verificationDocumentUrl?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { businessClaims } = await import('../drizzle/schema');
  
  await db.insert(businessClaims).values({
    userId: data.userId,
    locationId: data.locationId,
    verificationDocumentUrl: data.verificationDocumentUrl || null,
    notes: data.notes || null,
    status: "pending",
  });
}

/**
 * Check if user owns a location (approved claim)
 */
export async function userOwnsLocation(userId: number, locationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const { businessClaims } = await import('../drizzle/schema');
  
  const claim = await db
    .select()
    .from(businessClaims)
    .where(
      and(
        eq(businessClaims.userId, userId),
        eq(businessClaims.locationId, locationId),
        eq(businessClaims.status, "approved")
      )
    )
    .limit(1);

  return claim.length > 0;
}
