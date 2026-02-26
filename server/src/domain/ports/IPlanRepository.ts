import type { VideoPlan } from '../entities/VideoPlan.js';
import type { Niche } from '../entities/Niche.js';

/** Repository contract for video plans persistence */
export interface IPlanRepository {
  /** Save a video plan */
  save(plan: VideoPlan, userId: string): Promise<VideoPlan>;

  /** Retrieve all saved plans for a user, optionally filtered by niche */
  findAll(userId: string, niche?: Niche): Promise<VideoPlan[]>;

  /** Find a single plan by ID, optionally scoped to user */
  findById(id: string, userId?: string): Promise<VideoPlan | null>;

  /** Delete a plan by ID, optionally scoped to user */
  delete(id: string, userId?: string): Promise<void>;

  /** Count total plans across all users (admin stats) */
  countAll(): Promise<number>;
}
