import { BaseRepository } from "./base_repository.ts";
import { User } from "../types.ts";
import { Database } from "../deps.ts";

export class UserRepository extends BaseRepository<User> {
  constructor(db: Database) {
    super(db, "users");
  }

  async findByTelegramId(telegramId: number): Promise<User | undefined> {
    return await this.findOne({ telegramId });
  }

  async create(
    telegramId: number,
    firstName: string,
    lastName: string,
    className: string,
  ): Promise<User> {
    const user: Omit<User, "_id"> = {
      telegramId,
      firstName,
      lastName,
      class: className,
    };

    const id = await this.insertOne(user);
    return { ...user, _id: id };
  }

  async getClassesList(): Promise<string[]> {
    return await this.collection.distinct("class");
  }

  async findByClass(className: string): Promise<User[]> {
    return await this.find({ class: className });
  }
}
