import { GoogleGenAI, Type } from "@google/genai";

function getAi() {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey: apiKey as string });
}

export type Niche = 'psychology' | 'ambient';

export interface VideoIdea {
  title: string;
  hook: string;
  targetAudience: string;
  whyItWorks: string;
  searchVolume: "High" | "Medium" | "Rising Trend";
  primaryKeyword: string;
  secondaryKeywords: string[];
}

export async function generateVideoIdeas(topic: string, niche: Niche = 'psychology'): Promise<VideoIdea[]> {
  const ai = getAi();
  
  const systemPrompt = niche === 'psychology'
    ? `You are an expert YouTube strategist in the psychology and neuroscience niche. 
       The user wants to make a video about '${topic}'. 
       Generate 5 highly clickable, trending video ideas that people are actively searching for right now.
       Focus on human brain, behavior, mental health, and self-improvement.
       ВАЖНО: Канал для Tier-1! Сами идеи (title, hook, primaryKeyword, secondaryKeywords) пиши на АНГЛИЙСКОМ ЯЗЫКЕ. Объяснения (whyItWorks, targetAudience) пиши на РУССКОМ ЯЗЫКЕ для автора.`
    : `You are an expert YouTube strategist for a faceless Meditation and Ambient soundscape channel in 2026.
       The user wants to make a video about '${topic}'.
       Context: The meditation market is booming (high RPMs $10-$20 CPM). Success requires ultra-specific niches (Urban ambient, Nature cycles without music, Healing frequencies like 432Hz/528Hz, Devotional content). Production relies on field recorders, 2-8 hour long formats for high retention, and AI tools like NotebookLM for scientific intros.
       Generate 5 highly clickable, trending video ideas based on this 2026 research.
       In the 'whyItWorks' field, explicitly include details on the market potential, why this narrow niche works, and a brief production strategy (e.g., audio layering, field recording).
       ВАЖНО: Канал для Tier-1! Сами идеи (title, hook, primaryKeyword, secondaryKeywords) пиши на АНГЛИЙСКОМ ЯЗЫКЕ. Объяснения (whyItWorks, targetAudience) пиши на РУССКОМ ЯЗЫКЕ для автора.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: systemPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A highly clickable, intriguing YouTube video title.",
            },
            hook: {
              type: Type.STRING,
              description: "The first 5-10 seconds of the video script to grab attention.",
            },
            targetAudience: {
              type: Type.STRING,
              description: "Who is this video for? (e.g., 'People struggling with focus')",
            },
            whyItWorks: {
              type: Type.STRING,
              description: "Psychological reason why viewers will click and watch this.",
            },
            searchVolume: {
              type: Type.STRING,
              description: "Estimated search interest (High, Medium, or Rising Trend).",
            },
            primaryKeyword: {
              type: Type.STRING,
              description: "The main SEO search term to target.",
            },
            secondaryKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "3-5 related long-tail keywords.",
            },
          },
          required: ["title", "hook", "targetAudience", "whyItWorks", "searchVolume", "primaryKeyword", "secondaryKeywords"],
        },
      },
    },
  });

  try {
    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr) as VideoIdea[];
  } catch (e) {
    console.error("Failed to parse ideas:", e);
    return [];
  }
}

export async function generateVideoPlan(title: string, hook: string, niche: Niche = 'psychology'): Promise<string> {
  const ai = getAi();

  const outlineInstructions = niche === 'psychology'
    ? `## 📝 Detailed Script Outline

    ### ⏱️ YouTube Chapters
    (Provide a list of concise, keyword-rich chapter titles for each main section below. Example: '0:00 Intro: Unlock Your Brain Power', '0:30 The Memory Trap: Why You Forget', etc.)

    ### 📜 Script Breakdown
    - **0:00 - 0:30 | The Hook:** (Expand on the hook. Make it punchy, visually descriptive, and immediately state the value proposition. Use a pattern interrupt or a bold, counter-intuitive statement to prevent early drop-off.)
      - *Visual Hook Description:* (Suggest specific imagery, b-roll, or camera angles to use during the first 5 seconds to visually hook the viewer.)
    - **0:30 - 1:30 | The Problem (Relatability):** (Describe the viewer's pain points vividly. Use emotional language and highly specific real-world scenarios so they feel like you are reading their mind.)
    - **1:30 - 5:00 | The Neuroscience/Psychology (The "Why"):** (Explain the underlying brain mechanisms or psychological theories. CRITICAL: Use clear, relatable analogies to break down complex scientific concepts so anyone can understand them. E.g., "Think of dopamine like...")
    - **5:00 - 8:00 | The Solution (Actionable Steps):** (Provide a clear, step-by-step framework with 2-3 highly practical, science-backed steps the viewer can implement immediately. Avoid generic advice; give them a specific system.)
    - **8:00 - End | Outro:** (Summarize the main takeaway quickly and transition into the Call to Action.)

    ### 📢 Call to Action Options
    (Provide 3 distinct options for the video outro focusing on viewer engagement)
    1. **The Binge-Watcher:** (A seamless transition into a compelling hook for another related video on the channel. Create an "open loop" of curiosity.)
    2. **The Community Builder:** (A specific, thought-provoking question related to the video topic to drive comments and debate.)
    3. **The Subscriber Drive:** (A value-driven reason to subscribe, emphasizing what they will miss out on if they don't.)`
    : `## 📝 Production & Audio Blueprint

    ### ⏱️ YouTube Chapters (Timestamps)
    (Provide a list of timestamps for a 2-8 hour video. Example: '0:00 Intro: The Science of 432Hz', '2:00 Deep Sleep Ambient Loop Begins', '2:00:00 Gentle Fade Out')

    ### 🎙️ Spoken Intro/Outro (Optional NotebookLM Script)
    - **Intro (0:00 - 2:00):** (Write a soothing, scientifically-backed intro script explaining the benefits of this specific sound/frequency. Perfect for NotebookLM generation.)
    - **Outro:** (A gentle whisper or soft text on screen to subscribe for more sleep/focus content.)

    ### 🎧 Audio Engineering & Soundscape Design (2-8 Hour Strategy)
    - **Primary Audio Source:** (What to generate in Suno.ai or record. Note: Suno Pro Plan is required for commercial rights and YouTube monetization.)
    - **Track Extension Strategy:** (Explain how to turn short 3-minute Suno tracks into a 2-8 hour video. Recommend specific 2026 methods: 1. Looping seamless fragments, 2. Using AI Audio Stretch tools like Wondershare Filmora to stretch the track without losing quality/tempo, or 3. Compiling multiple Suno tracks into a mega-mix.)
    - **Layering & Mixing:** (How to mix the audio in professional editors like Descript or Filmora to create a clean, infinite studio-level soundscape. E.g., "Layer low-rumble thunder with close-mic rain drops.")

    ### 🎬 Visual Loop & Video Assembly Strategy
    - **Visual Concept:** (Describe a simple, seamless 10-30 second visual loop that fits the mood. E.g., A cinemagraph of a neon sign reflecting in a puddle.)
    - **Color Palette & Lighting:** (What colors promote the desired state? E.g., Deep blues and purples for sleep.)
    - **Video Assembly Workflow (Audio to MP4):** (Provide a step-by-step workflow for turning the final audio track into a YouTube-ready MP4. Explicitly recommend using tools like **Flowjin** for dynamic waveforms/subtitles or **Audiogram** for simple MP3-to-MP4 conversion with visual templates. Explain *how* to use them for this specific video concept.)`;

  const thumbnailInstructions = niche === 'psychology'
    ? `## 🖼️ 3 Thumbnail Visual Concepts
    (Describe 3 distinct visual concepts for the video thumbnail that would attract clicks. For each concept, explicitly explain *why* it would be engaging and effective at driving a high CTR.)`
    : `## 🖼️ 3 Thumbnail Visual Concepts
    (Describe 3 distinct visual concepts for the video thumbnail. For ambient/music channels, pure images aren't always enough. For each concept, describe:
    1. The AI-generated background image (the aesthetic vibe). CRITICAL: Explicitly instruct the AI to draw glowing soundwaves, audio visualizer bars, or subtle musical notes directly integrated into the environment (e.g., "glowing neon soundwaves reflecting in a puddle").
    2. The specific text overlay to add in post-production (e.g., "8 HOURS", "432 Hz", "DEEP SLEEP").
    3. A UI element or icon to add in post-production (e.g., a subtle glowing play button) to instantly signal to the viewer that this is an audio/music experience.)`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert YouTube producer, scriptwriter, and SEO specialist for a ${niche === 'psychology' ? 'psychology/neuroscience' : 'faceless meditation/ambient'} channel.
    Create a detailed YouTube video plan for the following idea:
    Title: ${title}
    Hook: ${hook}

    ВАЖНО: Канал ориентирован на Tier-1 (США/Европа). 
    - Сам СЦЕНАРИЙ, НАЗВАНИЯ ГЛАВ (Timestamps) и ТЕКСТЫ ДЛЯ ВИДЕО пиши на АНГЛИЙСКОМ ЯЗЫКЕ.
    - Промпты для обложек (Thumbnail Visual Concepts) пиши на АНГЛИЙСКОМ ЯЗЫКЕ.
    - Все советы по монтажу, объяснения структуры, режиссерские ремарки и пояснения для автора пиши на РУССКОМ ЯЗЫКЕ.

    Please provide the output in Markdown format with the following sections:
    ## 🎯 5 Alternative Viral Titles
    (List 5 more title options)

    ${thumbnailInstructions}

    ## 🔍 SEO Optimization
    - **Primary Keyword:** (The main search term to target)
    - **Secondary Keywords:** (3-5 related long-tail keywords)
    - **Full Video Description:** (Write a detailed, engaging, and SEO-optimized video description. The first 3 lines should be highly compelling and include the primary keyword. The rest of the description should summarize the video's value, include timestamps (chapters), and have a call to action.)
    - **Tags:** (Comma-separated list of 10-15 relevant tags)

    ${outlineInstructions}

    ## 💡 Retention Triggers
    (List 2-3 moments where the creator should change visuals, ask a question, or use a sound effect to keep attention. For ambient videos, this could be subtle lighting shifts or new audio layers introduced every hour.)`,
  });

  return response.text || "Failed to generate plan.";
}

export async function generateAlternativeTitles(titleIdea: string): Promise<string[]> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert YouTube strategist. The user has a video title idea: "${titleIdea}".
    Generate 5 highly clickable, viral alternative titles for this video.
    Focus on curiosity, emotional triggers, and clarity.
    ВАЖНО: Канал для Tier-1. Названия должны быть строго на АНГЛИЙСКОМ ЯЗЫКЕ.
    Return ONLY a JSON array of 5 strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr) as string[];
  } catch (e) {
    console.error("Failed to parse titles:", e);
    return [];
  }
}

export interface ChannelBranding {
  channelNames: string[];
  seoDescription: string;
  avatarPrompt: string;
  bannerPrompt: string;
}

export async function generateChannelBranding(videoTitle: string, niche: Niche): Promise<ChannelBranding | null> {
  const ai = getAi();
  const systemPrompt = `You are an expert YouTube brand strategist. The user has a video idea: "${videoTitle}" in the ${niche} niche.
  They want to create a brand new YouTube channel around this video's vibe and topic.
  
  ВАЖНО: Канал создается для Tier-1 аудитории. Абсолютно весь контент (Названия канала, SEO-описание, промпты для аватара и баннера) должен быть на АНГЛИЙСКОМ ЯЗЫКЕ.

  Generate:
  1. 3 catchy, memorable YouTube channel names (на английском).
  2. An SEO-optimized channel "About" description (approx 3-4 paragraphs) that includes keywords related to the niche (на английском).
  3. A highly detailed image generation prompt for a channel Avatar (Profile Picture) (на английском).
  4. A highly detailed image generation prompt for a channel Banner (Cover Art) (на английском).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: systemPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          channelNames: { type: Type.ARRAY, items: { type: Type.STRING } },
          seoDescription: { type: Type.STRING },
          avatarPrompt: { type: Type.STRING },
          bannerPrompt: { type: Type.STRING }
        },
        required: ["channelNames", "seoDescription", "avatarPrompt", "bannerPrompt"]
      }
    }
  });

  try {
    return JSON.parse(response.text?.trim() || "{}") as ChannelBranding;
  } catch (e) {
    console.error("Failed to parse branding:", e);
    return null;
  }
}

export async function generateNotebookLMSource(videoTitle: string, planMarkdown: string, niche: Niche): Promise<string | null> {
  const ai = getAi();
  const systemPrompt = `You are an expert content strategist and podcast producer.
  The user is creating a YouTube video titled: "${videoTitle}" in the ${niche} niche.
  Here is the detailed video plan:
  ${planMarkdown}

  Create a highly optimized "Source Document" for Google's NotebookLM. 
  ВАЖНО: Напиши этот документ полностью на АНГЛИЙСКОМ ЯЗЫКЕ, так как он будет использоваться в качестве промпта/источника для ИИ генерации аудио.
  
  The document MUST include:
  1. **Host Instructions:** A direct note to the NotebookLM hosts about the desired tone (e.g., engaging, empathetic, scientific but accessible for psychology; or soothing, deep, and atmospheric for ambient).
  2. **The Core Premise:** What is the main topic and why does it matter?
  3. **The Pain Points:** Relatable examples of what the audience is experiencing.
  4. **The Science/Theory/Concept:** A breakdown of the underlying psychology, neuroscience, or mechanics.
  5. **The Solution/Takeaway:** Step-by-step actionable advice or the core emotional takeaway.

  Format this as a clean, readable text document. Do not use markdown formatting that might confuse a text-to-speech engine (keep it conversational and structured).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: systemPrompt,
  });

  return response.text?.trim() || null;
}

export async function generateYouTubeDescription(videoTitle: string, planMarkdown: string, niche: Niche): Promise<string | null> {
  const ai = getAi();
  const systemPrompt = `You are an expert YouTube SEO specialist and copywriter.
  The user is publishing a video titled: "${videoTitle}" in the ${niche} niche.
  Here is the video plan/script:
  ${planMarkdown}

  Write a highly optimized YouTube video description.
  ВАЖНО: Канал для Tier-1 аудитории. Описание, тайм-коды, призывы к действию и хэштеги должны быть СТРОГО НА АНГЛИЙСКОМ ЯЗЫКЕ.
  
  The description MUST include:
  1. **First 2 lines (Above the fold):** A strong hook and a clear Call to Action (CTA) with a link placeholder (e.g., "Поддержите канал и скачайте аудио без сжатия: [ССЫЛКА]").
  2. **Brief Summary:** 2-3 sentences naturally incorporating keywords without keyword stuffing.
  3. **Intriguing Timestamps (Тайм-коды):** Create timestamps based on the video plan. CRITICAL: Do NOT include spoilers in the timestamps. Create curiosity (e.g., "03:15 - Ошибка, которую совершают 90% людей" instead of "03:15 - Не пейте кофе").
  4. **Hashtags:** 3-5 relevant hashtags at the very bottom.
  
  Format as plain text or minimal Markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: systemPrompt,
  });

  return response.text?.trim() || null;
}

export async function generateShortsSpinoffs(videoTitle: string, planMarkdown: string): Promise<string | null> {
  const ai = getAi();
  const systemPrompt = `You are a viral YouTube Shorts strategist.
  The user has a long-form video titled: "${videoTitle}".
  Here is the video plan:
  ${planMarkdown}

  Generate 3 highly engaging ideas for YouTube Shorts (under 60 seconds) that act as a funnel to the main video.
  ВАЖНО: Канал для Tier-1. Названия (Title), Хуки (Hook) и Призывы к действию (CTA) пиши на АНГЛИЙСКОМ ЯЗЫКЕ. Визуальные идеи (Visual Idea) и пояснения для автора пиши на РУССКОМ ЯЗЫКЕ.
  For each Short, provide:
  - **Title:** A catchy, clickbaity title.
  - **The Hook (0-3s):** Exactly what to say or show in the first 3 seconds to stop the scroll.
  - **Visual Idea:** What the viewer sees on screen.
  - **Call to Action (CTA):** How to drive them to the full video.
  
  Format as Markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: systemPrompt,
  });

  return response.text?.trim() || null;
}

export async function analyzeNiche(videoTitle: string, niche: Niche): Promise<string | null> {
  const ai = getAi();
  const systemPrompt = `You are an expert YouTube SEO analyst.
  The user wants to make a video titled: "${videoTitle}" in the ${niche} niche.
  
  Search the web for current YouTube trends, top videos, and audience intent related to this topic.
  ВАЖНО: Отвечай полностью на РУССКОМ ЯЗЫКЕ.
  Provide a brief "Niche Analysis" report containing:
  1. **Current Landscape:** What kind of videos are currently ranking for this topic?
  2. **Content Gaps:** What are other creators missing?
  3. **Unique Angle:** Suggest 1-2 unique ways the user can position their video to stand out from the competition.
  
  Format as Markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: systemPrompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text?.trim() || null;
}

export async function generateMonetizationCopy(videoTitle: string, niche: Niche): Promise<string | null> {
  const ai = getAi();
  const systemPrompt = `You are an expert copywriter for creators.
  The user is creating a YouTube video titled: "${videoTitle}" in the ${niche} niche.
  
  Write a compelling promotional text for their Patreon or Boosty page.
  ВАЖНО: Канал для Tier-1 аудитории. Текст должен быть полностью на АНГЛИЙСКОМ ЯЗЫКЕ.
  The goal is to convince viewers to buy or subscribe to get the high-quality, uncompressed audio file (FLAC/WAV) or an extended ad-free version of the video.
  Explain the value (e.g., YouTube compresses audio, ad interruptions ruin sleep/focus, etc.).
  Keep it persuasive, warm, and concise (2-3 paragraphs).
  
  Format as Markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: systemPrompt,
  });

  return response.text?.trim() || null;
}

export async function generateContentRoadmap(videoTitle: string, niche: Niche): Promise<string | null> {
  const ai = getAi();
  const systemPrompt = `You are a YouTube Channel Strategist.
  The user is launching a channel in the ${niche} niche, starting with a video titled: "${videoTitle}".
  
  Create a 30-Day Content Roadmap to help them build momentum.
  ВАЖНО: Отвечай полностью на РУССКОМ ЯЗЫКЕ.
  The roadmap should include:
  - **4 Long-form Video Ideas:** (1 per week) that logically follow or complement the first video.
  - **12 Shorts Ideas:** (3 per week) to drive traffic.
  - **Community Tab Strategy:** 2-3 ideas for polls or posts to engage the audience.
  
  Format as Markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: systemPrompt,
  });

  return response.text?.trim() || null;
}

export async function generateSunoPrompt(videoTitle: string, planMarkdown: string): Promise<string | null> {
  const ai = getAi();
  const systemPrompt = `You are an expert audio engineer and AI music prompt specialist. 
  The user is creating an ambient/meditation YouTube video titled: "${videoTitle}".
  Here is the video plan:
  ${planMarkdown}

  Generate a highly optimized prompt to paste into Suno.ai's "Style of Music" box to generate the perfect instrumental track for this video.
  ВАЖНО: Промпт должен быть ИСКЛЮЧИТЕЛЬНО НА АНГЛИЙСКОМ ЯЗЫКЕ.
  The prompt should be a comma-separated list of musical genres, instruments, moods, and audio descriptors (max 120 characters).
  Example: "ambient drone, 432Hz, deep sleep, ethereal synth, slow tempo, cinematic, no percussion, healing, atmospheric"
  
  Return ONLY the prompt string, nothing else.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: systemPrompt,
  });

  return response.text?.trim() || null;
}

export async function generateThumbnail(prompt: string): Promise<string | null> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "2K"
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

