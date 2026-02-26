import 'dotenv/config';
import { serve } from '@hono/node-server';
import { env } from './infrastructure/config/env.js';
import { createLogger } from './infrastructure/logger.js';
import { createDbClient } from './infrastructure/db/client.js';
import { GeminiAiService } from './infrastructure/ai/GeminiAiService.js';
import { IdeaRepository } from './infrastructure/db/IdeaRepository.js';
import { PlanRepository } from './infrastructure/db/PlanRepository.js';
import { UserRepository } from './infrastructure/db/UserRepository.js';
import { SessionRepository } from './infrastructure/db/SessionRepository.js';
import { ActivityLogRepository } from './infrastructure/db/ActivityLogRepository.js';
import { BcryptHasher } from './infrastructure/auth/BcryptHasher.js';
import { JwtService } from './infrastructure/auth/JwtService.js';
import { GenerateIdeas } from './application/use-cases/GenerateIdeas.js';
import { GeneratePlan } from './application/use-cases/GeneratePlan.js';
import { GenerateThumbnail } from './application/use-cases/GenerateThumbnail.js';
import { GenerateTitles } from './application/use-cases/GenerateTitles.js';
import { GenerateDescription } from './application/use-cases/GenerateDescription.js';
import { GenerateBranding } from './application/use-cases/GenerateBranding.js';
import { AnalyzeNiche } from './application/use-cases/AnalyzeNiche.js';
import { GenerateNotebookLM } from './application/use-cases/GenerateNotebookLM.js';
import { GenerateShorts } from './application/use-cases/GenerateShorts.js';
import { GenerateMonetization } from './application/use-cases/GenerateMonetization.js';
import { GenerateRoadmap } from './application/use-cases/GenerateRoadmap.js';
import { GenerateSunoPrompt } from './application/use-cases/GenerateSunoPrompt.js';
import { Register } from './application/use-cases/Register.js';
import { Login } from './application/use-cases/Login.js';
import { RefreshTokens } from './application/use-cases/RefreshTokens.js';
import { Logout } from './application/use-cases/Logout.js';
import { GetAllUsers } from './application/use-cases/GetAllUsers.js';
import { UpdateUserRole } from './application/use-cases/UpdateUserRole.js';
import { DeactivateUser } from './application/use-cases/DeactivateUser.js';
import { LogActivity } from './application/use-cases/LogActivity.js';
import { GetActivityLogs } from './application/use-cases/GetActivityLogs.js';
import { GetAdminStats } from './application/use-cases/GetAdminStats.js';
import { ExportPlan } from './application/use-cases/ExportPlan.js';
import { DocumentExporter } from './infrastructure/export/DocumentExporter.js';
import { PostHogService } from './infrastructure/analytics/index.js';
import { createApp } from './presentation/app.js';

const logger = createLogger('Server');

// --- Infrastructure ---
logger.debug('Wiring infrastructure layer');

const { db, sql } = createDbClient(env.DATABASE_URL);
const aiService = new GeminiAiService(env.GEMINI_API_KEY);
const ideaRepo = new IdeaRepository(db);
const planRepo = new PlanRepository(db);
const analytics = new PostHogService(env.POSTHOG_API_KEY, env.POSTHOG_HOST);
const userRepo = new UserRepository(db);
const sessionRepo = new SessionRepository(db);
const passwordHasher = new BcryptHasher();
const tokenService = new JwtService(env.JWT_SECRET, env.JWT_ACCESS_EXPIRES_IN);
const activityLogRepo = new ActivityLogRepository(db);
const documentExporter = new DocumentExporter();
logger.debug('Auth & export infrastructure initialized');

// --- Use cases ---
logger.debug('Wiring application use cases');

const generateIdeas = new GenerateIdeas(aiService, ideaRepo);
const generatePlan = new GeneratePlan(aiService, planRepo);
const generateThumbnail = new GenerateThumbnail(aiService);
const generateTitles = new GenerateTitles(aiService);
const generateDescription = new GenerateDescription(aiService);
const generateBranding = new GenerateBranding(aiService);
const analyzeNiche = new AnalyzeNiche(aiService);
const generateNotebookLM = new GenerateNotebookLM(aiService);
const generateShorts = new GenerateShorts(aiService);
const generateMonetization = new GenerateMonetization(aiService);
const generateRoadmap = new GenerateRoadmap(aiService);
const generateSunoPrompt = new GenerateSunoPrompt(aiService);
const register = new Register(userRepo, passwordHasher, sessionRepo, tokenService, env.JWT_REFRESH_EXPIRES_IN);
const login = new Login(userRepo, passwordHasher, sessionRepo, tokenService, env.JWT_REFRESH_EXPIRES_IN);
const refreshTokens = new RefreshTokens(sessionRepo, userRepo, tokenService, env.JWT_REFRESH_EXPIRES_IN);
const logout = new Logout(sessionRepo);
const getAllUsers = new GetAllUsers(userRepo);
const updateUserRole = new UpdateUserRole(userRepo);
const deactivateUser = new DeactivateUser(userRepo);
const logActivity = new LogActivity(activityLogRepo);
const getActivityLogs = new GetActivityLogs(activityLogRepo);
const getAdminStats = new GetAdminStats(userRepo, ideaRepo, planRepo);
const exportPlan = new ExportPlan(planRepo, documentExporter);
logger.debug('Auth, admin & export use cases initialized');

// --- Presentation ---
const app = createApp({
  generateIdeas,
  generatePlan,
  generateThumbnail,
  generateTitles,
  generateDescription,
  generateBranding,
  analyzeNiche,
  generateNotebookLM,
  generateShorts,
  generateMonetization,
  generateRoadmap,
  generateSunoPrompt,
  ideaRepo,
  planRepo,
  analytics,
  register,
  login,
  refreshTokens,
  logout,
  tokenService,
  userRepo,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  logActivity,
  getActivityLogs,
  getAdminStats,
  exportPlan,
});

// --- Start server ---
const server = serve({ fetch: app.fetch, port: env.PORT }, () => {
  logger.info(`Server started on http://localhost:${env.PORT}`);
});

// --- Graceful shutdown ---
async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close();
  await analytics.shutdown();
  await sql.end();
  logger.info('Server shut down complete');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
