import { Model, Document, FilterQuery, Types } from "mongoose";

export class BaseRepository<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string|Types.ObjectId): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      console.error(`Error finding document by ID: ${error}`);
      return null;
    }
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filter).exec();
    } catch (error) {
      console.error(`Error finding document: ${error}`);
      return null;
    }
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[] | null> {
    try {
      return await this.model.find(filter).exec();
    } catch (error) {
      console.error("Error finding all documents:", error);
      return null;
    }
  }

  async create(data: Partial<T>): Promise<T | null> {
    try {
      const createdDocument = new this.model(data);
      const savedDocument = await createdDocument.save();
      return savedDocument.toObject() as T; // Convert to plain object and cast to T
    } catch (error) {
      console.error("Error creating document:", error);
      return null;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (error) {
      console.error(`Error updating document with ID ${id}: ${error}`);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.model.findByIdAndDelete(id).exec();
      return true;
    } catch (error) {
      console.error(`Error deleting document with ID ${id}: ${error}`);
      return false;
    }
  }
}
