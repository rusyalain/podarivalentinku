import { BaseRepository } from "./base_repository.ts";
import { Valentine } from "../types.ts";
import { Database } from "../deps.ts";

interface TopUserResult {
  _id: number;
  count: number;
}

export class ValentineRepository extends BaseRepository<Valentine> {
  constructor(db: Database) {
    super(db, "valentines");
  }

  async create(
    senderId: number,
    recipientId: number,
  ): Promise<string> {
    const messageId = crypto.randomUUID();

    await this.insertOne({
      senderId,
      recipientId,
      messageId,
      timestamp: new Date(),
    });

    return messageId;
  }

  async getUserStatistics(telegramId: number): Promise<{
    sent: number;
    received: number;
  }> {
    const sentCount = await this.count({ senderId: telegramId });
    const receivedCount = await this.count({ recipientId: telegramId });

    return {
      sent: sentCount,
      received: receivedCount,
    };
  }

  async getTopUsers(
    field: "senderId" | "recipientId",
    limit: number = 5,
  ): Promise<TopUserResult[]> {
    const result = await this.collection
      .aggregate<TopUserResult>([
        {
          $group: {
            _id: `$${field}`,
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();

    return result;
  }
  async getTotalCount(): Promise<number> {
    return await this.count({});
  }
}
