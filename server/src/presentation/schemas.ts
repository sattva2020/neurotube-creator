import { z } from 'zod';

// --- Shared field schemas ---

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const nicheSchema = z.enum(['psychology', 'ambient']);

export const topicSchema = z.string().min(1, 'Topic is required').max(200);

export const titleSchema = z.string().min(1, 'Title is required').max(300);

export const planMarkdownSchema = z.string().min(1, 'Plan markdown is required');

export const promptSchema = z.string().min(1, 'Prompt is required').max(1000);

// --- Request body schemas ---

/** POST /api/ideas/generate */
export const generateIdeasSchema = z.object({
  topic: topicSchema,
  niche: nicheSchema,
});

/** GET /api/ideas?niche=psychology */
export const listIdeasQuerySchema = z.object({
  niche: nicheSchema.optional(),
});

/** POST /api/plans/generate */
export const generatePlanSchema = z.object({
  title: titleSchema,
  hook: z.string().min(1, 'Hook is required').max(500),
  niche: nicheSchema,
});

/** GET /api/plans?niche=psychology */
export const listPlansQuerySchema = z.object({
  niche: nicheSchema.optional(),
});

/** GET /api/plans/:id/export?format=pdf|docx */
export const exportPlanQuerySchema = z.object({
  format: z.enum(['pdf', 'docx']),
});

/** POST /api/thumbnails/generate */
export const generateThumbnailSchema = z.object({
  prompt: promptSchema,
});

/** POST /api/titles/generate */
export const generateTitlesSchema = z.object({
  titleIdea: titleSchema,
});

/** POST /api/descriptions/generate */
export const generateDescriptionSchema = z.object({
  videoTitle: titleSchema,
  planMarkdown: planMarkdownSchema,
  niche: nicheSchema,
});

/** POST /api/branding/generate */
export const generateBrandingSchema = z.object({
  videoTitle: titleSchema,
  niche: nicheSchema,
});

/** POST /api/analysis/niche */
export const analyzeNicheSchema = z.object({
  videoTitle: titleSchema,
  niche: nicheSchema,
});

/** POST /api/notebooklm/generate */
export const generateNotebookLMSchema = z.object({
  videoTitle: titleSchema,
  planMarkdown: planMarkdownSchema,
  niche: nicheSchema,
});

/** POST /api/shorts/generate */
export const generateShortsSchema = z.object({
  videoTitle: titleSchema,
  planMarkdown: planMarkdownSchema,
});

/** POST /api/monetization/generate */
export const generateMonetizationSchema = z.object({
  videoTitle: titleSchema,
  niche: nicheSchema,
});

/** POST /api/roadmap/generate */
export const generateRoadmapSchema = z.object({
  videoTitle: titleSchema,
  niche: nicheSchema,
});

/** POST /api/suno/generate */
export const generateSunoSchema = z.object({
  videoTitle: titleSchema,
  planMarkdown: planMarkdownSchema,
});

// --- Auth schemas ---

/** POST /api/auth/register */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must not exceed 128 characters'),
  displayName: z.string().min(1, 'Display name is required').max(100),
});

/** POST /api/auth/login */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required').max(128, 'Password must not exceed 128 characters'),
});

/** POST /api/auth/refresh */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/** POST /api/auth/logout */
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// --- Admin schemas ---

export const roleSchema = z.enum(['owner', 'admin', 'editor', 'viewer']);

/** PATCH /api/admin/users/:id/role */
export const updateUserRoleSchema = z.object({
  role: roleSchema,
});

/** GET /api/admin/users?role=admin */
export const listUsersQuerySchema = z.object({
  role: roleSchema.optional(),
});

/** GET /api/admin/activity-logs?limit=50&offset=0&userId=x&action=x */
export const activityLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
});
