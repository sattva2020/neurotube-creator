import type { VideoIdea } from '../entities/VideoIdea.js';
import type { Niche } from '../entities/Niche.js';

/** Repository contract for video ideas persistence */
export interface IIdeaRepository {
  /** Save multiple ideas (batch insert) */
  saveMany(ideas: VideoIdea[], topic: string): Promise<VideoIdea[]>;

  /** Retrieve all saved ideas, optionally filtered by niche */
  findAll(niche?: Niche): Promise<VideoIdea[]>;

  /** Find a single idea by ID */
  findById(id: string): Promise<VideoIdea | null>;

  /** Delete an idea by ID */
  delete(id: string): Promise<void>;
}
