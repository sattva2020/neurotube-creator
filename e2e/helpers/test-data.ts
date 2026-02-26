/**
 * Mock test data for E2E tests.
 * Shapes match shared/types — VideoIdea, VideoPlan, ChannelBranding.
 */

export const TEST_TOPICS = {
  psychology: 'dopamine detox morning routine',
  ambient: 'rain sounds for deep focus',
} as const;

export const NICHES = {
  psychology: 'psychology',
  ambient: 'ambient',
} as const;

export interface MockVideoIdea {
  id: string;
  title: string;
  hook: string;
  targetAudience: string;
  whyItWorks: string;
  searchVolume: 'High' | 'Medium' | 'Rising Trend';
  primaryKeyword: string;
  secondaryKeywords: string[];
  niche: 'psychology' | 'ambient';
  createdAt: string;
}

export interface MockVideoPlan {
  id: string;
  ideaId: string;
  title: string;
  markdown: string;
  niche: 'psychology' | 'ambient';
  createdAt: string;
}

export const MOCK_IDEAS: MockVideoIdea[] = [
  {
    id: 'idea-001',
    title: 'Why Your Brain Craves Dopamine (And How to Fix It)',
    hook: 'You check your phone 96 times a day — here is why your brain is hijacking you.',
    targetAudience: 'Self-improvement seekers aged 18-35',
    whyItWorks: 'Dopamine detox is a rising trend with 2M+ monthly searches.',
    searchVolume: 'High',
    primaryKeyword: 'dopamine detox',
    secondaryKeywords: ['dopamine fasting', 'brain reset', 'digital detox'],
    niche: 'psychology',
    createdAt: '2026-02-26T10:00:00Z',
  },
  {
    id: 'idea-002',
    title: 'The Morning Routine That Rewires Your Brain',
    hook: 'Neuroscientists agree: the first 90 minutes of your day define everything.',
    targetAudience: 'Productivity enthusiasts aged 25-45',
    whyItWorks: 'Morning routine content has evergreen appeal and high RPM.',
    searchVolume: 'High',
    primaryKeyword: 'morning routine neuroscience',
    secondaryKeywords: ['brain optimization', 'morning habits', 'cortisol awakening response'],
    niche: 'psychology',
    createdAt: '2026-02-26T10:01:00Z',
  },
  {
    id: 'idea-003',
    title: '5 Psychological Tricks That Change How People See You',
    hook: 'FBI negotiators use these 5 techniques — and you can too.',
    targetAudience: 'Communication skills seekers aged 20-40',
    whyItWorks: 'Social psychology content gets high engagement and shares.',
    searchVolume: 'Rising Trend',
    primaryKeyword: 'psychological tricks',
    secondaryKeywords: ['social influence', 'body language', 'persuasion techniques'],
    niche: 'psychology',
    createdAt: '2026-02-26T10:02:00Z',
  },
  {
    id: 'idea-004',
    title: 'How Music Physically Changes Your Brain Structure',
    hook: 'MRI scans prove that musicians have 30% more neural connections.',
    targetAudience: 'Music lovers and neuroscience fans aged 18-50',
    whyItWorks: 'Music + neuroscience crossover appeals to both niches.',
    searchVolume: 'Medium',
    primaryKeyword: 'music brain changes',
    secondaryKeywords: ['neuroplasticity music', 'brain imaging', 'auditory cortex'],
    niche: 'psychology',
    createdAt: '2026-02-26T10:03:00Z',
  },
  {
    id: 'idea-005',
    title: 'The Dark Psychology of Social Media Algorithms',
    hook: 'Your feed is not random — it is an engineered dopamine trap.',
    targetAudience: 'Tech-aware millennials and Gen Z aged 16-35',
    whyItWorks: 'Algorithm awareness is trending with Netflix documentaries.',
    searchVolume: 'Rising Trend',
    primaryKeyword: 'social media psychology',
    secondaryKeywords: ['algorithm manipulation', 'attention economy', 'digital wellbeing'],
    niche: 'psychology',
    createdAt: '2026-02-26T10:04:00Z',
  },
];

export const MOCK_PLAN: MockVideoPlan = {
  id: 'plan-001',
  ideaId: 'idea-001',
  title: 'Why Your Brain Craves Dopamine (And How to Fix It)',
  markdown: `# Why Your Brain Craves Dopamine (And How to Fix It)

## Hook (0:00-0:30)
You check your phone 96 times a day. That is not a habit — it is your brain being hijacked.

## Chapter 1: The Dopamine Loop (0:30-3:00)
- Explain dopamine reward prediction error
- Show brain scan imagery of nucleus accumbens
- Relatable examples: notifications, likes, infinite scroll

## Chapter 2: Why Detox Works (3:00-6:00)
- Baseline dopamine theory
- 48-hour reset protocol
- Scientific backing from Dr. Anna Lembke research

## Chapter 3: The 7-Day Protocol (6:00-9:00)
- Day 1-2: Digital sunset (no screens after 8 PM)
- Day 3-4: Single-task mornings
- Day 5-7: Reward scheduling

## Call to Action (9:00-9:30)
Subscribe for weekly neuroscience breakdowns.

## SEO Keywords
dopamine detox, brain reset, digital detox, dopamine fasting

## Thumbnail Concept
Split face: left side overwhelmed (phone notifications), right side calm (nature).
`,
  niche: 'psychology',
  createdAt: '2026-02-26T10:05:00Z',
};

export const MOCK_TITLES = [
  'Your Brain Is Addicted — Here Is The Fix',
  'Dopamine Detox: The Science Behind Resetting Your Brain',
  'I Did a 7-Day Dopamine Detox — Here Is What Happened',
  'Neuroscientist Explains: Why You Cannot Stop Scrolling',
  'The Dopamine Trap: How to Reclaim Your Focus',
];

export const MOCK_DESCRIPTION = `Are you constantly checking your phone? Your brain might be trapped in a dopamine loop.

In this video, we break down the neuroscience behind dopamine addiction and share a practical 7-day protocol to reset your brain.

CHAPTERS:
0:00 Introduction
0:30 The Dopamine Loop
3:00 Why Detox Works
6:00 The 7-Day Protocol
9:00 Next Steps

RESOURCES:
- Dr. Anna Lembke "Dopamine Nation"
- Huberman Lab Podcast Episode #39

#dopaminedetox #neuroscience #brainreset #digitaldetox
`;

export const MOCK_BRANDING = {
  channelNames: ['NeuroSpark', 'MindWired', 'BrainPulse'],
  seoDescription: 'Neuroscience-backed self-improvement. Weekly deep dives into how your brain works and how to optimize it.',
  avatarPrompt: 'Minimalist brain icon with electric blue neural connections on dark background',
  bannerPrompt: 'Wide cinematic banner showing neural network visualization with blue and purple gradients',
};

export const MOCK_SHORTS = [
  { title: '3 Signs Your Dopamine Is Too Low', concept: 'Quick list with brain scan visuals' },
  { title: 'Try This 60-Second Brain Reset', concept: 'Breathing exercise with timer overlay' },
  { title: 'Phones vs Brains: Who Wins?', concept: 'Side-by-side comparison animation' },
];

export const MOCK_TOOL_MARKDOWN = '# Generated Content\n\nThis is a mock tool response with **markdown** formatting.\n\n- Point 1\n- Point 2\n- Point 3\n';

// --- Auth mock data ---

export const MOCK_AUTH_USER = {
  id: 'user-001',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'editor' as const,
  isActive: true,
  createdAt: '2026-02-26T10:00:00Z',
};

export const MOCK_AUTH_ADMIN = {
  id: 'admin-001',
  email: 'admin@example.com',
  displayName: 'Admin User',
  role: 'admin' as const,
  isActive: true,
  createdAt: '2026-02-25T10:00:00Z',
};

export const MOCK_AUTH_RESPONSE = {
  user: MOCK_AUTH_USER,
  tokens: {
    accessToken: 'mock-access-token-123',
    refreshToken: 'mock-refresh-token-456',
  },
};

export const MOCK_AUTH_ADMIN_RESPONSE = {
  user: MOCK_AUTH_ADMIN,
  tokens: {
    accessToken: 'mock-admin-access-token',
    refreshToken: 'mock-admin-refresh-token',
  },
};

export const MOCK_ADMIN_USERS = {
  users: [
    { id: 'owner-001', email: 'owner@example.com', displayName: 'Owner', role: 'owner', isActive: true, createdAt: '2026-01-01T00:00:00Z' },
    MOCK_AUTH_ADMIN,
    MOCK_AUTH_USER,
    { id: 'user-002', email: 'viewer@example.com', displayName: 'Viewer User', role: 'viewer', isActive: true, createdAt: '2026-02-27T00:00:00Z' },
  ],
  total: 4,
};

console.debug('[test-data] Mock data loaded:', {
  ideas: MOCK_IDEAS.length,
  planId: MOCK_PLAN.id,
  titles: MOCK_TITLES.length,
  authUser: MOCK_AUTH_USER.email,
});
