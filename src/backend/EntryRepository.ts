import { Result } from "../lib/result.js";
import { EntryError } from "../lib/errors.js";

// Input type used when creating a new entry
export type CreateEntryInput = {
  title: string;
  body: string;
  tag?: string;
};

// App-level Entry type (what the rest of your app uses)
export type Entry = {
  id: number;
  title: string;
  body: string;
  tag: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

// Repository interface (THIS is what your service depends on)
export interface IEntryRepository {
  add(input: CreateEntryInput): Promise<Result<Entry, EntryError>>;
  getById(id: number): Promise<Result<Entry, EntryError>>;
  getAll(): Promise<Result<Entry[], EntryError>>;

  
  search(query: string): Promise<Result<Entry[], EntryError>>;
}