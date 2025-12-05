import { type User, type InsertUser, type Connection, type InsertConnection, type RpcLog, type InsertRpcLog, connections, users, rpcLogs } from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, gte, like, or } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface LogsFilter {
  network?: string;
  method?: string;
  status?: string;
  limit?: number;
  offset?: number;
  since?: Date;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnection(id: number): Promise<Connection | undefined>;
  getConnectionByApiKey(apiKey: string): Promise<Connection | undefined>;
  getAllConnections(): Promise<Connection[]>;
  incrementRequestCount(id: number): Promise<void>;
  deactivateConnection(id: number): Promise<void>;
  
  createRpcLog(log: InsertRpcLog): Promise<RpcLog>;
  getRpcLogs(filter?: LogsFilter): Promise<RpcLog[]>;
  getRecentLogs(limit?: number): Promise<RpcLog[]>;
  getLogStats(): Promise<{ totalRequests: number; errorCount: number; avgLatency: number }>;
}

function generateApiKey(): string {
  return `infra_${randomBytes(24).toString("hex")}`;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const apiKey = generateApiKey();
    const [connection] = await db
      .insert(connections)
      .values({
        ...insertConnection,
        apiKey,
      })
      .returning();
    return connection;
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    const [connection] = await db
      .select()
      .from(connections)
      .where(eq(connections.id, id));
    return connection || undefined;
  }

  async getConnectionByApiKey(apiKey: string): Promise<Connection | undefined> {
    const [connection] = await db
      .select()
      .from(connections)
      .where(eq(connections.apiKey, apiKey));
    return connection || undefined;
  }

  async getAllConnections(): Promise<Connection[]> {
    return db.select().from(connections);
  }

  async incrementRequestCount(id: number): Promise<void> {
    await db
      .update(connections)
      .set({ requestCount: sql`${connections.requestCount} + 1` })
      .where(eq(connections.id, id));
  }

  async deactivateConnection(id: number): Promise<void> {
    await db
      .update(connections)
      .set({ isActive: false })
      .where(eq(connections.id, id));
  }

  async createRpcLog(log: InsertRpcLog): Promise<RpcLog> {
    const [rpcLog] = await db
      .insert(rpcLogs)
      .values(log)
      .returning();
    return rpcLog;
  }

  async getRpcLogs(filter?: LogsFilter): Promise<RpcLog[]> {
    const conditions = [];
    
    if (filter?.network) {
      conditions.push(eq(rpcLogs.network, filter.network));
    }
    if (filter?.method) {
      conditions.push(like(rpcLogs.method, `%${filter.method}%`));
    }
    if (filter?.status) {
      conditions.push(eq(rpcLogs.status, filter.status));
    }
    if (filter?.since) {
      conditions.push(gte(rpcLogs.timestamp, filter.since));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(rpcLogs)
        .where(and(...conditions))
        .orderBy(desc(rpcLogs.timestamp))
        .limit(filter?.limit || 100)
        .offset(filter?.offset || 0);
    }
    
    return db
      .select()
      .from(rpcLogs)
      .orderBy(desc(rpcLogs.timestamp))
      .limit(filter?.limit || 100)
      .offset(filter?.offset || 0);
  }

  async getRecentLogs(limit: number = 50): Promise<RpcLog[]> {
    return db
      .select()
      .from(rpcLogs)
      .orderBy(desc(rpcLogs.timestamp))
      .limit(limit);
  }

  async getLogStats(): Promise<{ totalRequests: number; errorCount: number; avgLatency: number }> {
    const [stats] = await db
      .select({
        totalRequests: sql<number>`count(*)::int`,
        errorCount: sql<number>`count(case when ${rpcLogs.status} = 'error' then 1 end)::int`,
        avgLatency: sql<number>`coalesce(avg(${rpcLogs.latency})::int, 0)`,
      })
      .from(rpcLogs);
    
    return {
      totalRequests: stats?.totalRequests || 0,
      errorCount: stats?.errorCount || 0,
      avgLatency: stats?.avgLatency || 0,
    };
  }
}

export const storage = new DatabaseStorage();
