import type { VideoIdea } from '../entities/VideoIdea.js';
import type { ChannelBranding } from '../entities/ChannelBranding.js';
import type { Niche } from '../entities/Niche.js';

/** AI generation service contract — 12 methods covering all use cases */
export interface IAiService {
  /** Generate 5 video ideas with SEO keywords, hooks, audience analysis */
  generateIdeas(topic: string, niche: Niche): Promise<VideoIdea[]>;

  /** Generate full video production plan (Markdown) */
  generatePlan(title: string, hook: string, niche: Niche): Promise<string>;

  /** Generate thumbnail image via AI image model, returns base64 data URL or null */
  generateThumbnail(prompt: string): Promise<string | null>;

  /** Generate 5 alternative viral titles */
  generateTitles(titleIdea: string): Promise<string[]>;

  /** Generate channel branding: names, SEO description, avatar/banner prompts */
  generateBranding(videoTitle: string, niche: Niche): Promise<ChannelBranding | null>;

  /** Generate NotebookLM source document for AI podcast creation */
  generateNotebookLMSource(videoTitle: string, planMarkdown: string, niche: Niche): Promise<string | null>;

  /** Generate SEO-optimized YouTube description */
  generateDescription(videoTitle: string, planMarkdown: string, niche: Niche): Promise<string | null>;

  /** Generate 3 YouTube Shorts spinoff ideas as traffic funnels */
  generateShortsSpinoffs(videoTitle: string, planMarkdown: string): Promise<string | null>;

  /** Analyze niche: current landscape, content gaps, unique angles (uses Google Search grounding) */
  analyzeNiche(videoTitle: string, niche: Niche): Promise<string | null>;

  /** Generate Patreon/Boosty promotional copy */
  generateMonetizationCopy(videoTitle: string, niche: Niche): Promise<string | null>;

  /** Generate 30-day content roadmap with long-form, Shorts, and community tab ideas */
  generateContentRoadmap(videoTitle: string, niche: Niche): Promise<string | null>;

  /** Generate optimized Suno.ai music prompt for ambient track creation */
  generateSunoPrompt(videoTitle: string, planMarkdown: string): Promise<string | null>;
}
