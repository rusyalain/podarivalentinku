import { Collection, Database, ISession, MongoClient } from "./deps.ts";
import { UserRepository } from "./repositories/user_repository.ts";
import { ValentineRepository } from "./repositories/valentine_repository.ts";
import { BlockedRepository } from "./repositories/blocked_repository.ts";

export class DB {
  private client: MongoClient;
  private db?: Database;
  private sessions?: Collection<ISession>;

  public users?: UserRepository;
  public valentines?: ValentineRepository;
  public blockedUsers?: BlockedRepository;

  constructor() {
    this.client = new MongoClient();
  }

  async init() {
    try {
      await this.client.connect(Deno.env.get("MONGODB_URI") || "");
      this.db = this.client.database("valentine_bot");

      if (!this.db) {
        throw new Error("Failed to initialize database");
      }

      this.sessions = this.db.collection<ISession>("sessions");

      this.users = new UserRepository(this.db);
      this.valentines = new ValentineRepository(this.db);
      this.blockedUsers = new BlockedRepository(this.db);

      console.log("Database connection established successfully");
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err);
      throw err;
    }
  }

  getSessions(): Collection<ISession> {
    if (!this.sessions) {
      throw new Error("Sessions collection is not initialized");
    }
    return this.sessions;
  }
}

const db = new DB();
await db.init();

export default db;
