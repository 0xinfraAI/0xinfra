import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with trial management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Trial and subscription fields
  planType: varchar("plan_type").notNull().default("trial"), // trial, free, starter, pro, enterprise
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  apiCallsUsed: integer("api_calls_used").notNull().default(0),
  apiCallsLimit: integer("api_calls_limit").notNull().default(100000), // 100k for trial
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  planType: true,
  trialStart: true,
  trialEnd: true,
  apiCallsUsed: true,
  apiCallsLimit: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  label: text("label").notNull(),
  network: text("network").notNull(),
  apiKey: text("api_key").notNull().unique(),
  allowedIp: text("allowed_ip"),
  isActive: boolean("is_active").notNull().default(true),
  requestCount: integer("request_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  apiKey: true,
  createdAt: true,
  requestCount: true,
  isActive: true,
});

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

export const rpcLogs = pgTable("rpc_logs", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull(),
  connectionId: integer("connection_id"),
  apiKeyLast4: text("api_key_last4"),
  network: text("network").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull(), // "success" | "error"
  statusCode: integer("status_code"),
  latency: integer("latency").notNull(), // in milliseconds
  requestBody: jsonb("request_body"),
  responseBody: jsonb("response_body"),
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertRpcLogSchema = createInsertSchema(rpcLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertRpcLog = z.infer<typeof insertRpcLogSchema>;
export type RpcLog = typeof rpcLogs.$inferSelect;
