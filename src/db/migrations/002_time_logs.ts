import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('time_logs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('ticket_id', 'integer', (col) =>
      col.references('tickets.id').onDelete('cascade').notNull(),
    )
    .addColumn('user_id', 'integer', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('hours', 'integer', (col) => col.notNull())
    .addColumn('logged_at', 'timestamptz', (col) =>
      col.defaultTo(db.fn('now')).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('time_logs').execute();
}