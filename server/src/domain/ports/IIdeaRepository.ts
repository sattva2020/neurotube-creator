import type { VideoIdea } from '../entities/VideoIdea.js';
import type { Niche } from '../entities/Niche.js';

/** Repository contract for video ideas persistence */
export interface IIdeaRepository {
  /** Save multiple ideas (batch insert) */
  saveMany(ideas: VideoIdea[], topic: string, userId: string): Promise<VideoIdea[]>;

  /** Retrieve all saved ideas for a user, optionally filtered by niche */
  findAll(userId: string, niche?: Niche): Promise<VideoIdea[]>;

  /** Find a single idea by ID, optionally scoped to user */
  findById(id: string, userId?: string): Promise<VideoIdea | null>;

  /** Delete an idea by ID, optionally scoped to user */
  delete(id: string, userId?: string): Promise<void>;

  /** Count total ideas across all users (admin stats) */
  countAll(): Promise<number>;
}
