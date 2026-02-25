import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const ideas = pgTable('ideas', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  hook: text('hook').notNull(),
  targetAudience: text('target_audience').notNull(),
  whyItWorks: text('why_it_works').notNull(),
  searchVolume: text('search_volume').notNull(),
  primaryKeyword: text('primary_keyword').notNull(),
  secondaryKeywords: jsonb('secondary_keywords').$type<string[]>().notNull(),
  niche: text('niche').notNull(),
  topic: text('topic').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  ideaId: uuid('idea_id').references(() => ideas.id),
  title: text('title').notNull(),
  markdown: text('markdown').notNull(),
  niche: text('niche').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
