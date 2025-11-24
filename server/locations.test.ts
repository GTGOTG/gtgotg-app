import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("locations API", () => {
  it("should fetch locations by state", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.locations.byState({
      state: "CA",
      limit: 10,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("category");
      expect(result[0]).toHaveProperty("latitude");
      expect(result[0]).toHaveProperty("longitude");
    }
  });

  it("should limit results when specified", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.locations.byState({
      state: "CA",
      limit: 5,
    });

    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("should fetch a single location by ID", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // First get a location to test with
    const locations = await caller.locations.byState({
      state: "CA",
      limit: 1,
    });

    if (locations.length > 0) {
      const locationId = locations[0]!.id;
      const result = await caller.locations.byId(locationId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(locationId);
    }
  });

  it("should return locations within bounds", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // California bounding box (approximate)
    const result = await caller.locations.inBounds({
      minLat: 32.5,
      maxLat: 42.0,
      minLng: -124.5,
      maxLng: -114.0,
      limit: 100,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(100);

    // Verify all results are within bounds
    result.forEach(loc => {
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);
      expect(lat).toBeGreaterThanOrEqual(32.5);
      expect(lat).toBeLessThanOrEqual(42.0);
      expect(lng).toBeGreaterThanOrEqual(-124.5);
      expect(lng).toBeLessThanOrEqual(-114.0);
    });
  });

  it("should filter locations by category", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.locations.inBounds({
      minLat: 32.5,
      maxLat: 42.0,
      minLng: -124.5,
      maxLng: -114.0,
      categories: ["Rest Area"],
      limit: 50,
    });

    expect(result).toBeDefined();
    
    // All results should be Rest Areas
    result.forEach(loc => {
      expect(loc.category).toBe("Rest Area");
    });
  });
});
