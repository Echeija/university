import * as fs from 'fs';

const content = fs.readFileSync('server.ts', 'utf-8');
const patch = `
  // --- Facilities API ---
  app.get("/api/facilities", requireAuth, async (req, res) => {
    try {
      const { facilities } = await import('./src/db/schema.js');
      const allFacilities = await db.select().from(facilities);
      res.json(allFacilities);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch facilities' });
    }
  });

  app.post("/api/facility-bookings", requireAuth, async (req, res) => {
    try {
      const { facilityBookings } = await import('./src/db/schema.js');
      const { facilityId, startTime, endTime, purpose } = req.body;
      
      const [newBooking] = await db.insert(facilityBookings).values({
        facilityId,
        userId: (req as any).user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose,
        status: 'Pending'
      }).returning();
      
      res.json(newBooking);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to submit booking' });
    }
  });

  app.get("/api/facility-bookings", requireAuth, async (req, res) => {
    try {
      const { facilityBookings, facilities } = await import('./src/db/schema.js');
      const { eq } = await import('drizzle-orm');
      const userId = (req as any).user.id;
      
      const bookings = await db
        .select({
          id: facilityBookings.id,
          facilityId: facilityBookings.facilityId,
          facilityName: facilities.name,
          startTime: facilityBookings.startTime,
          endTime: facilityBookings.endTime,
          purpose: facilityBookings.purpose,
          status: facilityBookings.status
        })
        .from(facilityBookings)
        .innerJoin(facilities, eq(facilityBookings.facilityId, facilities.id))
        .where(eq(facilityBookings.userId, userId));
        
      res.json(bookings);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  app.patch("/api/facility-bookings/:id/status", requireAuth, async (req, res) => {
    try {
      const { facilityBookings } = await import('./src/db/schema.js');
      const { eq, and } = await import('drizzle-orm');
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).user.id;
      
      const [updated] = await db
        .update(facilityBookings)
        .set({ status })
        .where(and(eq(facilityBookings.id, parseInt(id)), eq(facilityBookings.userId, userId)))
        .returning();
        
      if (!updated) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update booking' });
    }
  });

`;

const replaced = content.replace('// --- Hostels API ---', patch + '// --- Hostels API ---');
fs.writeFileSync('server.ts', replaced);
console.log('patched');
