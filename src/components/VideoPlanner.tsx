import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Loader2, ArrowLeft, Copy, Check, Mic, Image as ImageIcon, Sparkles, Type as TypeIcon, Youtube, Music, FileText, Download, Smartphone, Search, DollarSign, Calendar, AlignLeft } from 'lucide-react';
import { Button } from './Button';
import { generateThumbnail, generateAlternativeTitles, generateChannelBranding, generateSunoPrompt, generateNotebookLMSource, generateShortsSpinoffs, analyzeNiche, generateMonetizationCopy, generateContentRoadmap, generateYouTubeDescription, ChannelBranding, VideoIdea, Niche } from '../services/geminiService';

interface VideoPlannerProps {
  planMarkdown: string | null;
  isLoading: boolean;
  onBack: () => void;
  idea: VideoIdea | null;
  niche: Niche;
}

export const VideoPlanner: React.FC<VideoPlannerProps> = ({ planMarkdown, isLoading, onBack, idea, niche }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  
  const [thumbnailPrompt, setThumbnailPrompt] = useState("");
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const [titleInput, setTitleInput] = useState("");
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  const [isGeneratingBranding, setIsGeneratingBranding] = useState(false);
  const [branding, setBranding] = useState<ChannelBranding | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);

  const [sunoPrompt, setSunoPrompt] = useState<string | null>(null);
  const [isGeneratingSuno, setIsGeneratingSuno] = useState(false);
  const [isSunoPromptCopied, setIsSunoPromptCopied] = useState(false);

  const [notebookLMSource, setNotebookLMSource] = useState<string | null>(null);
  const [isGeneratingNotebookLM, setIsGeneratingNotebookLM] = useState(false);
  const [isNotebookLMCopied, setIsNotebookLMCopied] = useState(false);

  const [shortsSpinoffs, setShortsSpinoffs] = useState<string | null>(null);
  const [isGeneratingShorts, setIsGeneratingShorts] = useState(false);

  const [nicheAnalysis, setNicheAnalysis] = useState<string | null>(null);
  const [isAnalyzingNiche, setIsAnalyzingNiche] = useState(false);

  const [monetizationCopy, setMonetizationCopy] = useState<string | null>(null);
  const [isGeneratingMonetization, setIsGeneratingMonetization] = useState(false);

  const [contentRoadmap, setContentRoadmap] = useState<string | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  const [youtubeDescription, setYoutubeDescription] = useState<string | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isDescriptionCopied, setIsDescriptionCopied] = useState(false);

  const [isThumbnailPromptCopied, setIsThumbnailPromptCopied] = useState(false);
  const [isAvatarPromptCopied, setIsAvatarPromptCopied] = useState(false);
  const [isBannerPromptCopied, setIsBannerPromptCopied] = useState(false);

  const copyToClipboard = async (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadTxt = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = async () => {
    if (!planMarkdown) return;
    try {
      await navigator.clipboard.writeText(planMarkdown);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!thumbnailPrompt.trim()) return;
    setIsGeneratingThumbnail(true);
    try {
      const url = await generateThumbnail(thumbnailPrompt);
      if (url) {
        setThumbnailUrl(url);
      } else {
        alert("Failed to generate thumbnail. Please try a different prompt.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate thumbnail. If you see 'Requested entity was not found', please refresh and re-select your API key.");
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const handleGenerateTitles = async () => {
    if (!titleInput.trim()) return;
    setIsGeneratingTitles(true);
    try {
      const titles = await generateAlternativeTitles(titleInput);
      setGeneratedTitles(titles);
    } catch (e) {
      console.error(e);
      alert("Failed to generate titles.");
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleGenerateBranding = async () => {
    if (!idea) return;
    setIsGeneratingBranding(true);
    try {
      const result = await generateChannelBranding(idea.title, niche);
      if (result) {
        setBranding(result);
      } else {
        alert("Failed to generate channel branding.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate channel branding.");
    } finally {
      setIsGeneratingBranding(false);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!branding?.avatarPrompt) return;
    setIsGeneratingAvatar(true);
    try {
      const url = await generateThumbnail(branding.avatarPrompt);
      if (url) setAvatarUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleGenerateBanner = async () => {
    if (!branding?.bannerPrompt) return;
    setIsGeneratingBanner(true);
    try {
      const url = await generateThumbnail(branding.bannerPrompt);
      if (url) setBannerUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBanner(false);
    }
  };

  const handleGenerateSunoPrompt = async () => {
    if (!idea) return;
    setIsGeneratingSuno(true);
    try {
      const prompt = await generateSunoPrompt(idea.title, planMarkdown || "");
      if (prompt) setSunoPrompt(prompt);
    } catch (e) {
      console.error(e);
      alert("Failed to generate Suno prompt.");
    } finally {
      setIsGeneratingSuno(false);
    }
  };

  const handleGenerateNotebookLM = async () => {
    if (!idea) return;
    setIsGeneratingNotebookLM(true);
    try {
      const source = await generateNotebookLMSource(idea.title, planMarkdown || "", niche);
      if (source) setNotebookLMSource(source);
    } catch (e) {
      console.error(e);
      alert("Failed to generate NotebookLM source document.");
    } finally {
      setIsGeneratingNotebookLM(false);
    }
  };

  const handleGenerateShorts = async () => {
    if (!idea) return;
    setIsGeneratingShorts(true);
    try {
      const shorts = await generateShortsSpinoffs(idea.title, planMarkdown || "");
      if (shorts) setShortsSpinoffs(shorts);
    } catch (e) {
      console.error(e);
      alert("Failed to generate Shorts spinoffs.");
    } finally {
      setIsGeneratingShorts(false);
    }
  };

  const handleAnalyzeNiche = async () => {
    if (!idea) return;
    setIsAnalyzingNiche(true);
    try {
      const analysis = await analyzeNiche(idea.title, niche);
      if (analysis) setNicheAnalysis(analysis);
    } catch (e) {
      console.error(e);
      alert("Failed to analyze niche.");
    } finally {
      setIsAnalyzingNiche(false);
    }
  };

  const handleGenerateMonetization = async () => {
    if (!idea) return;
    setIsGeneratingMonetization(true);
    try {
      const copy = await generateMonetizationCopy(idea.title, niche);
      if (copy) setMonetizationCopy(copy);
    } catch (e) {
      console.error(e);
      alert("Failed to generate monetization copy.");
    } finally {
      setIsGeneratingMonetization(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!idea) return;
    setIsGeneratingRoadmap(true);
    try {
      const roadmap = await generateContentRoadmap(idea.title, niche);
      if (roadmap) setContentRoadmap(roadmap);
    } catch (e) {
      console.error(e);
      alert("Failed to generate content roadmap.");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!idea) return;
    setIsGeneratingDescription(true);
    try {
      const desc = await generateYouTubeDescription(idea.title, planMarkdown || "", niche);
      if (desc) setYoutubeDescription(desc);
    } catch (e) {
      console.error(e);
      alert("Failed to generate YouTube description.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Генерация плана видео...</h3>
        <p className="text-slate-500 text-center mt-2 max-w-sm">
          Анализируем тему, пишем хуки и создаем концепты обложек.
        </p>
      </div>
    );
  }

  if (!planMarkdown) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden px-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold text-slate-900">План видео (Blueprint)</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleCopy}
            className="text-slate-600 hover:text-indigo-600"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-emerald-500" />
                Скопировано!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Скопировать план
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="p-6 md:p-8 overflow-y-auto">
        <div className="prose prose-slate prose-indigo max-w-none mb-10">
          <Markdown>{planMarkdown}</Markdown>
        </div>

        {/* Title Generator Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <TypeIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Генератор названий</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Есть рабочее название? Введите его ниже, чтобы получить 5 вирусных альтернатив для высокого CTR.
          </p>
          
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="напр., Как перестать откладывать дела..."
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <Button 
              onClick={handleGenerateTitles} 
              disabled={isGeneratingTitles || !titleInput.trim()}
              className="self-end"
            >
              {isGeneratingTitles ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Сгенерировать названия
                </>
              )}
            </Button>
          </div>

          {generatedTitles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Альтернативные названия:</h4>
              <ul className="space-y-2">
                {generatedTitles.map((t, i) => (
                  <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">{i + 1}.</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* YouTube Description Generator Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <AlignLeft className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Генератор идеального описания (с тайм-кодами)</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Сгенерируйте SEO-описание для YouTube с интригующими тайм-кодами без спойлеров и правильным призывом к действию в первой строке.
          </p>

          {!youtubeDescription ? (
            <Button 
              onClick={handleGenerateDescription} 
              disabled={isGeneratingDescription}
              className="w-full"
            >
              {isGeneratingDescription ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация описания...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Сгенерировать описание для YouTube
                </>
              )}
            </Button>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
              <div className="absolute top-3 right-3 flex gap-2">
                <button 
                  onClick={() => copyToClipboard(youtubeDescription, setIsDescriptionCopied)}
                  className="text-xs flex items-center text-slate-500 hover:text-indigo-600 transition-colors bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm"
                >
                  {isDescriptionCopied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                  {isDescriptionCopied ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2 pr-40">Описание для YouTube:</h4>
              <div className="prose prose-sm prose-slate max-w-none bg-white p-3 rounded-lg border border-slate-200 max-h-96 overflow-y-auto">
                <Markdown>{youtubeDescription}</Markdown>
              </div>
            </div>
          )}
        </div>

        {/* NotebookLM Source Generator Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Создать подкаст в NotebookLM</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Хотите превратить этот план в подкаст с двумя ведущими? Сгенерируйте оптимизированный "Исходный документ", скачайте его и загрузите в Google NotebookLM для создания Audio Overview.
          </p>

          {!notebookLMSource ? (
            <Button 
              onClick={handleGenerateNotebookLM} 
              disabled={isGeneratingNotebookLM}
              className="w-full"
            >
              {isGeneratingNotebookLM ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация документа...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Сгенерировать документ
                </>
              )}
            </Button>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
              <div className="absolute top-3 right-3 flex gap-2">
                <button 
                  onClick={() => copyToClipboard(notebookLMSource, setIsNotebookLMCopied)}
                  className="text-xs flex items-center text-slate-500 hover:text-indigo-600 transition-colors bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm"
                >
                  {isNotebookLMCopied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                  {isNotebookLMCopied ? 'Скопировано' : 'Копировать'}
                </button>
                <button 
                  onClick={() => handleDownloadTxt(notebookLMSource, `NotebookLM_Source_${idea?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'video'}.txt`)}
                  className="text-xs flex items-center text-slate-500 hover:text-indigo-600 transition-colors bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Скачать .txt
                </button>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2 pr-40">Исходный документ (на английском):</h4>
              <div className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-3 rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
                {notebookLMSource}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                <strong>Следующий шаг:</strong> Скачайте этот .txt файл, откройте <a href="https://notebooklm.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">NotebookLM</a>, создайте новый блокнот, загрузите файл как источник и нажмите "Generate Audio Overview".
              </p>
            </div>
          )}
        </div>

        {/* Shorts Spinoffs Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Генератор идей для Shorts</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Сгенерируйте 3 вовлекающие идеи для YouTube Shorts (до 60 секунд), которые будут работать как воронка на основное видео.
          </p>

          {!shortsSpinoffs ? (
            <Button 
              onClick={handleGenerateShorts} 
              disabled={isGeneratingShorts}
              className="w-full"
            >
              {isGeneratingShorts ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация Shorts...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Сгенерировать идеи для Shorts
                </>
              )}
            </Button>
          ) : (
            <div className="prose prose-sm prose-slate max-w-none bg-slate-50 border border-slate-200 rounded-xl p-4">
              <Markdown>{shortsSpinoffs}</Markdown>
            </div>
          )}
        </div>

        {/* Niche Analyzer Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Анализ ниши (YouTube Search Intent)</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Поиск по сети текущих трендов YouTube, топовых видео и намерений аудитории, чтобы найти ваш уникальный угол подачи.
          </p>

          {!nicheAnalysis ? (
            <Button 
              onClick={handleAnalyzeNiche} 
              disabled={isAnalyzingNiche}
              className="w-full"
            >
              {isAnalyzingNiche ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Анализ ниши...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Анализировать нишу
                </>
              )}
            </Button>
          ) : (
            <div className="prose prose-sm prose-slate max-w-none bg-slate-50 border border-slate-200 rounded-xl p-4">
              <Markdown>{nicheAnalysis}</Markdown>
            </div>
          )}
        </div>

        {/* Monetization Copy Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Текст для монетизации (Patreon / Boosty)</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Напишите убедительный промо-текст для вашей страницы Patreon или Boosty, чтобы продавать аудио без сжатия или версии без рекламы.
          </p>

          {!monetizationCopy ? (
            <Button 
              onClick={handleGenerateMonetization} 
              disabled={isGeneratingMonetization}
              className="w-full"
            >
              {isGeneratingMonetization ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация текста...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Сгенерировать текст
                </>
              )}
            </Button>
          ) : (
            <div className="prose prose-sm prose-slate max-w-none bg-slate-50 border border-slate-200 rounded-xl p-4">
              <Markdown>{monetizationCopy}</Markdown>
            </div>
          )}
        </div>

        {/* Content Roadmap Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Стратегия канала на 30 дней</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Сгенерируйте контент-план на 30 дней, чтобы набрать обороты (4 длинных видео и 12 Shorts).
          </p>

          {!contentRoadmap ? (
            <Button 
              onClick={handleGenerateRoadmap} 
              disabled={isGeneratingRoadmap}
              className="w-full"
            >
              {isGeneratingRoadmap ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация плана...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Сгенерировать план на 30 дней
                </>
              )}
            </Button>
          ) : (
            <div className="prose prose-sm prose-slate max-w-none bg-slate-50 border border-slate-200 rounded-xl p-4">
              <Markdown>{contentRoadmap}</Markdown>
            </div>
          )}
        </div>

        {/* Thumbnail Generator Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Генерация обложки (Thumbnail)</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Скопируйте один из концептов обложки (на английском) из плана выше, вставьте сюда, и Nano Banana 3 Pro сгенерирует ее для вас.
          </p>
          
          <div className="flex flex-col gap-3">
            <div className="relative">
              <textarea
                value={thumbnailPrompt}
                onChange={(e) => setThumbnailPrompt(e.target.value)}
                placeholder="напр., A split screen. On the left, a dark, chaotic brain. On the right, a glowing, organized brain..."
                className="w-full p-3 pr-12 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[80px] resize-y"
              />
              <button 
                onClick={() => copyToClipboard(thumbnailPrompt, setIsThumbnailPromptCopied)}
                title="Копировать промпт"
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                {isThumbnailPromptCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <Button 
              onClick={handleGenerateThumbnail} 
              disabled={isGeneratingThumbnail || !thumbnailPrompt.trim()}
              className="self-end"
            >
              {isGeneratingThumbnail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация (~10 сек)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Сгенерировать картинку
                </>
              )}
            </Button>
          </div>

          {thumbnailUrl && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-900 mb-2">Сгенерированная обложка:</h4>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video relative">
                <img 
                  src={thumbnailUrl} 
                  alt="Generated Thumbnail" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <a 
                  href={thumbnailUrl} 
                  download="thumbnail.png"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Скачать картинку
                </a>
              </div>
            </div>
          )}
        </div>
        {/* Suno.ai Prompt Generator Section (Ambient Only) */}
        {niche === 'ambient' && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Генерация промпта для Suno.ai</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Нужен уникальный саундтрек? Сгенерируйте оптимизированный промпт (на английском), чтобы вставить его в Suno.ai (рекомендуется Pro Plan для коммерческих прав) и создать идеальный эмбиент-трек для этого видео.
            </p>

            {!sunoPrompt ? (
              <Button 
                onClick={handleGenerateSunoPrompt} 
                disabled={isGeneratingSuno}
                className="w-full"
              >
                {isGeneratingSuno ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Генерация промпта...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Сгенерировать промпт для Suno
                  </>
                )}
              </Button>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative mt-4">
                <button 
                  onClick={() => copyToClipboard(sunoPrompt, setIsSunoPromptCopied)}
                  className="absolute top-3 right-3 text-xs flex items-center text-slate-500 hover:text-indigo-600 transition-colors bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm"
                >
                  {isSunoPromptCopied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                  {isSunoPromptCopied ? 'Скопировано' : 'Копировать промпт'}
                </button>
                <h4 className="text-sm font-bold text-slate-900 mb-2 pr-24">Промпт для Suno.ai:</h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-3 rounded-lg border border-slate-200">{sunoPrompt}</p>
                <p className="text-xs text-slate-500 mt-3">
                  <strong>Совет:</strong> Вставьте это в "Custom Mode" (поле Style of Music) в Suno. Оставьте поле Lyrics пустым для инструментального эмбиента.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Channel Branding Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Youtube className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Создать канал для этого видео</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Хотите создать совершенно новый канал вокруг этой идеи? Сгенерируйте название канала, SEO-описание и визуальные материалы.
          </p>

          {!branding && (
            <Button 
              onClick={handleGenerateBranding} 
              disabled={isGeneratingBranding}
              className="w-full"
            >
              {isGeneratingBranding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация айдентики канала...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Сгенерировать бренд канала
                </>
              )}
            </Button>
          )}

          {branding && (
            <div className="space-y-6 mt-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Идеи названий канала:</h4>
                <ul className="space-y-2">
                  {branding.channelNames.map((name, i) => (
                    <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">SEO-описание "О канале":</h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm whitespace-pre-wrap">
                  {branding.seoDescription}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900">Аватар канала</h4>
                    <button 
                      onClick={() => copyToClipboard(branding.avatarPrompt, setIsAvatarPromptCopied)}
                      className="text-xs flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      {isAvatarPromptCopied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                      {isAvatarPromptCopied ? 'Скопировано' : 'Копировать промпт'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 flex-grow">{branding.avatarPrompt}</p>
                  
                  {avatarUrl ? (
                    <div className="aspect-square rounded-full overflow-hidden border-4 border-slate-100 mx-auto w-32 h-32 mb-3">
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <Button 
                      onClick={handleGenerateAvatar} 
                      disabled={isGeneratingAvatar}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isGeneratingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : "Сгенерировать аватар"}
                    </Button>
                  )}
                </div>

                {/* Banner */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900">Баннер канала</h4>
                    <button 
                      onClick={() => copyToClipboard(branding.bannerPrompt, setIsBannerPromptCopied)}
                      className="text-xs flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      {isBannerPromptCopied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                      {isBannerPromptCopied ? 'Скопировано' : 'Копировать промпт'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 flex-grow">{branding.bannerPrompt}</p>
                  
                  {bannerUrl ? (
                    <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 mb-3">
                      <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <Button 
                      onClick={handleGenerateBanner} 
                      disabled={isGeneratingBanner}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isGeneratingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : "Сгенерировать баннер"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
