import { Err, Ok, Result } from "../lib/result.js";
import { CreateEntryInput, Entry, IEntryRepository } from "../repository/EntryRepository.js";
import { EntryError, EntryNotFound, InvalidContent, ValidationError } from "../lib/errors.js";

// Service contract for domain rules and orchestration over repository calls.
export interface IEntryService {
  createEntry(input: CreateEntryInput): Promise<Result<Entry, EntryError>>;
  listEntries(): Promise<Result<Entry[], EntryError>>;

  // ✅ 🔥 ADD THIS (Member B)
  searchEntries(query: string): Promise<Result<Entry[], EntryError>>;
}

class EntryService implements IEntryService {
  constructor(private readonly repository: IEntryRepository) {}

  async createEntry(input: CreateEntryInput): Promise<Result<Entry, EntryError>> {
    const title = String(input.title ?? "").trim();
    const body = String(input.body ?? "").trim();
    const tag = String(input.tag ?? "general").trim().toLowerCase();

    if (!title || !body) {
      return Err(InvalidContent("Title and body are required."));
    }

    if (title.length < 3) {
      return Err(ValidationError("Title must be at least 3 characters."));
    }

    if (body.length < 8) {
      return Err(ValidationError("Body must be at least 8 characters."));
    }

    if (!/^[a-z0-9-]{2,20}$/.test(tag)) {
      return Err(
        ValidationError("Tag must be 2-20 chars (lowercase letters, numbers, hyphen)."),
      );
    }

    return this.repository.add({ title, body, tag });
  }

  async listEntries(): Promise<Result<Entry[], EntryError>> {
    return this.repository.getAll();
  }

  // ✅ 🔥 THIS IS YOUR PART (Member B)
  async searchEntries(query: string): Promise<Result<Entry[], EntryError>> {
    const q = String(query ?? "").trim();

    // validation
    if (!q) {
      return Err(ValidationError("Search query cannot be empty."));
    }

    // call repository
    const result = await this.repository.search(q);

    // propagate repo errors (EntryNotFound, DB errors, etc.)
    if (!result.ok) {
      return result;
    }

    // optional safety check (repo already handles this)
    if (result.value.length === 0) {
      return Err(EntryNotFound("No entries found."));
    }

    return Ok(result.value);
  }
}

export function CreateEntryService(repository: IEntryRepository): IEntryService {
  return new EntryService(repository);
}