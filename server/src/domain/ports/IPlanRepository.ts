import type { VideoPlan } from '../entities/VideoPlan.js';
import type { Niche } from '../entities/Niche.js';

/** Repository contract for video plans persistence */
export interface IPlanRepository {
  /** Save a video plan */
  save(plan: VideoPlan): Promise<VideoPlan>;

  /** Retrieve all saved plans, optionally filtered by niche */
  findAll(niche?: Niche): Promise<VideoPlan[]>;
}
