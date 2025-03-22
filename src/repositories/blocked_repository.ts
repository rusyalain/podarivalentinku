import { BaseRepository } from "./base_repository.ts";
import { Database } from "../deps.ts";

export interface BlockedUser {
  telegramId: number;
  blockedAt: Date;
}

export class BlockedRepository extends BaseRepository<BlockedUser> {
  constructor(db: Database) {
    super(db, "blocked_users");
  }

  async blockUser(telegramId: number): Promise<void> {
    const user = await this.findOne({ telegramId });
    if (!user) {
      await this.insertOne({ telegramId, blockedAt: new Date() });
    }
  }

  async unblockUser(telegramId: number): Promise<void> {
    await this.collection.deleteOne({ telegramId });
  }

  async isUserBlocked(telegramId: number): Promise<boolean> {
    const user = await this.findOne({ telegramId });
    return user !== undefined;
  }
}
