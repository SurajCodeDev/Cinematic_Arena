import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('player'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(), accountId: text('accountId').notNull(), providerId: text('providerId').notNull(), userId: text('userId').notNull(), accessToken: text('accessToken'), refreshToken: text('refreshToken'), idToken: text('idToken'), accessTokenExpiresAt: timestamp('accessTokenExpiresAt'), refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'), scope: text('scope'), password: text('password'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(), expiresAt: timestamp('expiresAt').notNull(), createdAt: timestamp('createdAt').defaultNow(), updatedAt: timestamp('updatedAt').defaultNow(),
})

export const tournaments = pgTable('tournaments', {
  id: serial('id').primaryKey(), title: text('title').notNull(), mode: text('mode').notNull(), map: text('map').notNull(), startsAt: timestamp('starts_at').notNull(), prizePool: integer('prize_pool').notNull().default(0), entryFee: integer('entry_fee').notNull().default(0), maxSlots: integer('max_slots').notNull().default(100), status: text('status').notNull().default('open'), antiCheat: boolean('anti_cheat').notNull().default(true), createdAt: timestamp('created_at').notNull().defaultNow(), createdBy: text('created_by').notNull(),
})

export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(), tournamentId: integer('tournament_id').notNull(), userId: text('user_id').notNull(), squadName: text('squad_name'), roster: jsonb('roster').notNull().default([]), paymentStatus: text('payment_status').notNull().default('pending'), shareToken: text('share_token').notNull().unique(), createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const auditEvents = pgTable('audit_events', {
  id: serial('id').primaryKey(), actorUserId: text('actor_user_id').notNull(), action: text('action').notNull(), entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(), metadata: jsonb('metadata').notNull().default({}), createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const schema = { user, session, account, verification, tournaments, registrations, auditEvents }
export type Tournament = typeof tournaments.$inferSelect
export type Registration = typeof registrations.$inferSelect
