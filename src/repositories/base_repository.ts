import {
  Collection,
  Database,
  Document,
  type Filter,
  ObjectId,
} from "../deps.ts";

export abstract class BaseRepository<T extends Document> {
  protected collection: Collection<T>;

  constructor(db: Database, collectionName: string) {
    this.collection = db.collection<T>(collectionName);
  }

  protected async findOne(filter: Filter<T>): Promise<T | undefined> {
    return await this.collection.findOne(filter);
  }

  protected async find(filter: Filter<T>): Promise<T[]> {
    return await this.collection.find(filter).toArray();
  }

  protected async insertOne(document: Omit<T, "_id">): Promise<ObjectId> {
    return await this.collection.insertOne(document);
  }

  protected async count(filter: Filter<T>): Promise<number> {
    return await this.collection.countDocuments(filter);
  }
}
