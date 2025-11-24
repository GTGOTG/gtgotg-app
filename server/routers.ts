import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Location and review routers
  locations: router({
    // Get locations in viewport (for map)
    inBounds: publicProcedure
      .input(z.object({
        minLat: z.number(),
        maxLat: z.number(),
        minLng: z.number(),
        maxLng: z.number(),
        categories: z.array(z.string()).optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getLocationsInBounds } = await import('./db');
        return await getLocationsInBounds(input);
      }),
    
    // Get locations by state
    byState: publicProcedure
      .input(z.object({
        state: z.string().length(2),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getLocationsByState } = await import('./db');
        return await getLocationsByState(input.state, input.limit);
      }),
    
    // Get single location details
    byId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { getLocationById } = await import('./db');
        return await getLocationById(input);
      }),
  }),
  
  reviews: router({
    // Get reviews for a location
    byLocation: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { getLocationReviews } = await import('./db');
        return await getLocationReviews(input);
      }),
    
    // Create a review (protected)
    create: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        cleanlinessRating: z.number().min(1).max(5),
        adaComplianceRating: z.number().min(1).max(5).optional(),
        safetyRating: z.number().min(1).max(5),
        restroomTypeUsed: z.enum(["male", "female", "unisex_family"]),
        usedAdaStall: z.boolean(),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createReview } = await import('./db');
        
        // Filter profanity
        let filteredComment = input.comment;
        if (filteredComment) {
          const badWords = ['fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'bastard', 'crap'];
          badWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            filteredComment = filteredComment!.replace(regex, '*'.repeat(word.length));
          });
        }
        
        await createReview({
          locationId: input.locationId,
          userId: ctx.user.id,
          cleanlinessRating: input.cleanlinessRating,
          adaComplianceRating: input.adaComplianceRating || null,
          safetyRating: input.safetyRating,
          restroomTypeUsed: input.restroomTypeUsed,
          usedAdaStall: input.usedAdaStall ? 1 : 0,
          comment: filteredComment || null,
        });
        
        return { success: true };
      }),
  }),
  
  user: router({
    // Get user's badges
    badges: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserBadges } = await import('./db');
        return await getUserBadges(ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
