import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { thumbnailsRoutes } from '../thumbnails.js';
import { titlesRoutes } from '../titles.js';
import { descriptionsRoutes } from '../descriptions.js';
import { brandingRoutes } from '../branding.js';
import { analysisRoutes } from '../analysis.js';
import { notebooklmRoutes } from '../notebooklm.js';
import { shortsRoutes } from '../shorts.js';
import { monetizationRoutes } from '../monetization.js';
import { roadmapRoutes } from '../roadmap.js';
import { sunoRoutes } from '../suno.js';

function post(app: Hono, path: string, body: Record<string, unknown>) {
  return app.request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Thumbnails Route', () => {
  const mockUseCase = { execute: vi.fn().mockResolvedValue('data:image/png;base64,abc') };
  let app: Hono;

  beforeEach(() => {
    mockUseCase.execute.mockClear();
    app = new Hono();
    app.route('/api/thumbnails', thumbnailsRoutes(mockUseCase as any));
  });

  it('should generate thumbnail with valid prompt', async () => {
    const res = await post(app, '/api/thumbnails/generate', { prompt: 'A brain glowing in the dark' });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: string };
    expect(body.data).toBe('data:image/png;base64,abc');
    expect(mockUseCase.execute).toHaveBeenCalledWith('A brain glowing in the dark');
  });

  it('should return 400 for empty prompt', async () => {
    const res = await post(app, '/api/thumbnails/generate', { prompt: '' });
    expect(res.status).toBe(400);
  });
});

describe('Titles Route', () => {
  const mockUseCase = { execute: vi.fn().mockResolvedValue(['Title A', 'Title B']) };
  let app: Hono;

  beforeEach(() => {
    mockUseCase.execute.mockClear();
    app = new Hono();
    app.route('/api/titles', titlesRoutes(mockUseCase as any));
  });

  it('should generate titles with valid input', async () => {
    const res = await post(app, '/api/titles/generate', { titleIdea: 'Brain Hacks' });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: string[] };
    expect(body.data).toEqual(['Title A', 'Title B']);
    expect(mockUseCase.execute).toHaveBeenCalledWith('Brain Hacks');
  });

  it('should return 400 for missing titleIdea', async () => {
    const res = await post(app, '/api/titles/generate', {});
    expect(res.status).toBe(400);
  });
});

describe('Descriptions Route', () => {
  const mockUseCase = { execute: vi.fn().mockResolvedValue('SEO description text') };
  let app: Hono;

  beforeEach(() => {
    mockUseCase.execute.mockClear();
    app = new Hono();
    app.route('/api/descriptions', descriptionsRoutes(mockUseCase as any));
  });

  it('should generate description with valid input', async () => {
    const res = await post(app, '/api/descriptions/generate', {
      videoTitle: 'Brain Hacks',
      planMarkdown: '# Plan',
      niche: 'psychology',
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: string };
    expect(body.data).toBe('SEO description text');
    expect(mockUseCase.execute).toHaveBeenCalledWith('Brain Hacks', '# Plan', 'psychology');
  });

  it('should return 400 for missing planMarkdown', async () => {
    const res = await post(app, '/api/descriptions/generate', {
      videoTitle: 'Test',
      niche: 'psychology',
    });
    expect(res.status).toBe(400);
  });
});

describe('Branding Route', () => {
  const mockBranding = {
    channelNames: ['NeuroVibes'],
    seoDescription: 'Psychology channel',
    avatarPrompt: 'A brain logo',
    bannerPrompt: 'Neural banner',
  };
  const mockUseCase = { execute: vi.fn().mockResolvedValue(mockBranding) };
  let app: Hono;

  beforeEach(() => {
    mockUseCase.execute.mockClear();
    app = new Hono();
    app.route('/api/branding', brandingRoutes(mockUseCase as any));
  });

  it('should generate branding with valid input', async () => {
    const res = await post(app, '/api/branding/generate', { videoTitle: 'Brain Hacks', niche: 'psychology' });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: typeof mockBranding };
    expect(body.data).toEqual(mockBranding);
    expect(mockUseCase.execute).toHaveBeenCalledWith('Brain Hacks', 'psychology');
  });

  it('should return 400 for invalid niche', async () => {
    const res = await post(app, '/api/branding/generate', { videoTitle: 'Test', niche: 'invalid' });
    expect(res.status).toBe(400);
  });
});

describe('Analysis Route', () => {
  const mockUseCase = { execute: vi.fn().mockResolvedValue('Niche analysis text') };
  let app: Hono;

  beforeEach(() => {
    mockUseCase.execute.mockClear();
    app = new Hono();
    app.route('/api/analysis', analysisRoutes(mockUseCase as any));
  });

  it('should analyze niche with valid input', async () => {
    const res = await post(app, '/api/analysis/niche', { videoTitle: 'Brain Hacks', niche: 'psychology' });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: string };
    expect(body.data).toBe('Niche analysis text');
    expect(mockUseCase.execute).toHaveBeenCalledWith('Brain Hacks', 'psychology');
  });

  it('should return 400 for missing videoTitle', async () => {
    const res = await post(app, '/api/analysis/niche', { niche: 'psychology' });
    expect(res.status).toBe(400);
  });
});

describe('NotebookLM Route', () => {
  const mockUseCase = { execute: vi.fn().mockResolvedValue('Source document content') };
  let app: Hono;

  beforeEach(() => {
    mockUseCase.execute.mockClear();
    app = new Hono();
    app.route('/api/notebooklm', notebooklmRoutes(mockUseCase as any));
  });

  it('should generate NotebookLM source with valid input', async () => {
    const res = await post(app, '/api/notebooklm/generate', {
      videoTitle: 'Brain Hacks',
      planMarkdown: '# Plan',
      niche: 'psychology',
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: string };
    expect(body.data).toBe('Source document content');
    expect(mockUseCase.execute).toHaveBeenCalledWith('Brain Hacks', '# Plan', 'psychology');
  });
});

describe('Shorts Route', () => {
  const mockUseCase = { execute: vi.fn().mockResolvedValue('3 Shorts ideas') };
  let app: Hono;

  beforeEach(() => {
    mockUseCase.execute.mockClear();
    app = new Hono();
    app.route('/api/shorts', shortsRoutes(mockUseCase as any));
  });

  it('should generate shorts with valid input', async () => {
    const res = await post(app, '/api/shorts/generate', {
      videoTitle: 'Brain Hacks',
      planMarkdown: '# Plan',
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: string };
    expect(body.data).toBe('3 Shorts ideas');
    expect(mockUseCase.execute).toHaveBeenCalledWith('Brain Hacks', '# Plan');
  });
});

describe('Monetization Route', () => {
  const mockUseCase = { execute: vi.fn().mockResolvedValue('Patreon copy') };
  let app: Hono;

  beforeEach(() => {
    mockUseCase.execute.mockClear();
    app = new Hono();
    app.route('/api/monetization', monetizationRoutes(mockUseCase as any));
  });

  it('should generate monetization copy with valid input', async () => {
    const res = await post(app, '/api/monetization/generate', { videoTitle: 'Brain Hacks', niche: 'ambient' });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: string };
    expect(body.data).toBe('Patreon copy');
    expect(mockUseCase.execute).toHaveBeenCalledWith('Brain Hacks', 'ambient');
  });
});

describe('Roadmap Route', () => {
  const mockUseCase = { execute: vi.fn().mockResolvedValue('30-day plan') };
  let app: Hono;

  beforeEach(() => {
    mockUseCase.execute.mockClear();
    app = new Hono();
    app.route('/api/roadmap', roadmapRoutes(mockUseCase as any));
  });

  it('should generate roadmap with valid input', async () => {
    const res = await post(app, '/api/roadmap/generate', { videoTitle: 'Brain Hacks', niche: 'psychology' });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: string };
    expect(body.data).toBe('30-day plan');
    expect(mockUseCase.execute).toHaveBeenCalledWith('Brain Hacks', 'psychology');
  });
});

describe('Suno Route', () => {
  const mockUseCase = { execute: vi.fn().mockResolvedValue('Ambient lo-fi prompt') };
  let app: Hono;

  beforeEach(() => {
    mockUseCase.execute.mockClear();
    app = new Hono();
    app.route('/api/suno', sunoRoutes(mockUseCase as any));
  });

  it('should generate suno prompt with valid input', async () => {
    const res = await post(app, '/api/suno/generate', {
      videoTitle: 'Meditation Vibes',
      planMarkdown: '# Plan',
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: string };
    expect(body.data).toBe('Ambient lo-fi prompt');
    expect(mockUseCase.execute).toHaveBeenCalledWith('Meditation Vibes', '# Plan');
  });
});
