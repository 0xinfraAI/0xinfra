import { type User, type InsertUser, type Connection, type InsertConnection, connections, users } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { randomBytes } from "crypto";

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
}

export const storage = new DatabaseStorage();
