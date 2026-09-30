import { db, TimeLog } from '../db/database.js';

// Insert a new time log
export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<TimeLog> {
  return await db
    .insertInto('time_logs')
    .values({
      ticket_id: ticketId,
      user_id: userId,
      hours,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

// Get the total hours logged for a ticket
export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  const result = await db
    .selectFrom('time_logs')
    .select(({ fn }) => fn.sum<number>('hours').as('total_hours'))
    .where('ticket_id', '=', ticketId)
    .executeTakeFirst();

  return Number(result?.total_hours ?? 0);
}