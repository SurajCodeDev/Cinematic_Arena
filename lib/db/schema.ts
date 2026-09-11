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

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(), registrationId: integer('registration_id').notNull(), userId: text('user_id').notNull(), provider: text('provider').notNull(), amount: integer('amount').notNull(), status: text('status').notNull().default('pending'), providerReference: text('provider_reference'), proofUrl: text('proof_url'), createdAt: timestamp('created_at').notNull().defaultNow(), updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(), tournamentId: integer('tournament_id').notNull(), title: text('title').notNull(), startsAt: timestamp('starts_at').notNull(), roomId: text('room_id'), roomPassword: text('room_password'), status: text('status').notNull().default('scheduled'), createdBy: text('created_by').notNull(), createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const fairPlayReports = pgTable('fair_play_reports', {
  id: serial('id').primaryKey(), tournamentId: integer('tournament_id').notNull(), reporterUserId: text('reporter_user_id').notNull(), reportedUserId: text('reported_user_id'), reason: text('reason').notNull(), evidenceUrl: text('evidence_url'), status: text('status').notNull().default('open'), resolution: text('resolution'), createdAt: timestamp('created_at').notNull().defaultNow(), resolvedAt: timestamp('resolved_at'),
})

export const matchResults = pgTable('match_results', {
  id: serial('id').primaryKey(), matchId: integer('match_id').notNull(), registrationId: integer('registration_id').notNull(), placement: integer('placement').notNull().default(0), kills: integer('kills').notNull().default(0), points: integer('points').notNull().default(0), status: text('status').notNull().default('pending'), approvedBy: text('approved_by'), createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const prizeLedger = pgTable('prize_ledger', {
  id: serial('id').primaryKey(), tournamentId: integer('tournament_id').notNull(), registrationId: integer('registration_id'), winnerUserId: text('winner_user_id'), amount: integer('amount').notNull(), status: text('status').notNull().default('pending'), releasedAt: timestamp('released_at'), createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const disputes = pgTable('disputes', {
  id: serial('id').primaryKey(), tournamentId: integer('tournament_id').notNull(), registrationId: integer('registration_id'), openedBy: text('opened_by').notNull(), category: text('category').notNull(), details: text('details').notNull(), status: text('status').notNull().default('open'), resolution: text('resolution'), createdAt: timestamp('created_at').notNull().defaultNow(), resolvedAt: timestamp('resolved_at'),
})

export const auditEvents = pgTable('audit_events', {
  id: serial('id').primaryKey(), actorUserId: text('actor_user_id').notNull(), action: text('action').notNull(), entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(), metadata: jsonb('metadata').notNull().default({}), createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const schema = { user, session, account, verification, tournaments, registrations, payments, matches, fairPlayReports, matchResults, prizeLedger, disputes, auditEvents }
export type Tournament = typeof tournaments.$inferSelect
export type Registration = typeof registrations.$inferSelect
