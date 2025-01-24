"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
// BaseRepository is a generic class to perform CRUD operations
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    // Create a new document
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doc = new this.model(data);
                const savedDoc = yield doc.save();
                return savedDoc; // Type assertion to resolve the type mismatch
            }
            catch (error) {
                throw new Error(`Error creating document: ${error}`);
            }
        });
    }
    // Find a document by its ID
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model.findById(id).exec();
            }
            catch (error) {
                throw new Error(`Error finding document by ID: ${error}`);
            }
        });
    }
    // Find a document based on a filter
    findOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model.findOne(filter).exec();
            }
            catch (error) {
                throw new Error(`Error finding document: ${error}`);
            }
        });
    }
    // Update a document by its ID
    updateById(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
            }
            catch (error) {
                throw new Error(`Error updating document: ${error}`);
            }
        });
    }
    // Delete a document by its ID
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.model.findByIdAndDelete(id).exec();
                return result ? true : false;
            }
            catch (error) {
                throw new Error(`Error deleting document: ${error}`);
            }
        });
    }
    // Find all documents
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model.find().exec();
            }
            catch (error) {
                throw new Error(`Error finding documents: ${error}`);
            }
        });
    }
}
exports.BaseRepository = BaseRepository;
