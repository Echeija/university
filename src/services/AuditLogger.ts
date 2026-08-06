import { db } from '../db';
import { auditTrails } from '../db/schema';

export class AuditLogger {
  static async log(userId: number, action: string, details?: string) {
    try {
      await db.insert(auditTrails).values({
        userId,
        action,
        details: details || null,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }
}
