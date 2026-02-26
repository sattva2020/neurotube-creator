import type { Niche } from './Niche.js';

/** Full video production plan (Markdown) */
export interface VideoPlan {
  id?: string;
  userId?: string;
  ideaId?: string;
  title: string;
  markdown: string;
  niche: Niche;
  createdAt?: Date;
}
