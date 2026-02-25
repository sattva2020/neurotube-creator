import React, { useState, useEffect } from 'react';
import { Brain, Search, Sparkles, Youtube, Loader2, Key, Headphones } from 'lucide-react';
import { generateVideoIdeas, generateVideoPlan, VideoIdea, Niche } from './services/geminiService';
import { IdeaCard } from './components/IdeaCard';
import { VideoPlanner } from './components/VideoPlanner';
import { Button } from './components/Button';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const PRESETS = {
  psychology: [
    "Dopamine Detox",
    "Procrastination",
    "Anxiety & Overthinking",
    "Neuroplasticity",
    "Burnout Recovery",
    "Habit Formation"
  ],
  ambient: [
    "Urban Rain Focus",
    "432Hz Deep Healing",
    "Tokyo Night Walk",
    "Morning Forest Loop",
    "528Hz DNA Repair",
    "Binaural Beats Study"
  ]
};

export default function App() {
  const [hasKey, setHasKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [activeNiche, setActiveNiche] = useState<Niche>('psychology');

  const [topic, setTopic] = useState('');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  
  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planMarkdown, setPlanMarkdown] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasKey(has);
      } else {
        // If not running in AI Studio environment, assume true or handle differently
        setHasKey(true);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true); // Assume success to mitigate race condition
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleGenerateIdeas = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic.trim()) return;

    setIsGeneratingIdeas(true);
    setIdeas([]);
    setSelectedIdea(null);
    setPlanMarkdown(null);

    try {
      const newIdeas = await generateVideoIdeas(topic, activeNiche);
      setIdeas(newIdeas);
    } catch (error) {
      console.error("Error generating ideas:", error);
      alert("Failed to generate ideas. Please try again.");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleSelectIdea = async (idea: VideoIdea) => {
    setSelectedIdea(idea);
    setIsGeneratingPlan(true);
    setPlanMarkdown(null);

    try {
      const plan = await generateVideoPlan(idea.title, idea.hook, activeNiche);
      setPlanMarkdown(plan);
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Failed to generate video plan. Please try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  if (isCheckingKey) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Требуется API Ключ</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Для использования высококачественной модели <strong>Nano Banana 3 Pro</strong> для генерации обложек, вам необходимо предоставить собственный API ключ Gemini.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-8 text-sm text-slate-600 text-left">
            <p className="mb-2">1. Перейдите в Google Cloud Console</p>
            <p className="mb-2">2. Включите биллинг для вашего проекта</p>
            <p>3. Создайте API ключ Gemini</p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline mt-3 inline-block font-medium">
              Читать документацию по биллингу &rarr;
            </a>
          </div>
          <Button onClick={handleSelectKey} size="lg" className="w-full">
            Выбрать API Ключ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl text-white ${activeNiche === 'psychology' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              {activeNiche === 'psychology' ? <Brain className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
            </div>
            <span className="font-bold text-xl tracking-tight">NeuroTube Creator</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <Youtube className="w-4 h-4 text-red-500" />
            {activeNiche === 'psychology' ? 'Психология и Наука' : 'Эмбиент и Медитация'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Niche Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-200/50 p-1 rounded-full inline-flex">
            <button
              onClick={() => { setActiveNiche('psychology'); setIdeas([]); setTopic(''); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeNiche === 'psychology' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Brain className="w-4 h-4" />
              Психология и Наука
            </button>
            <button
              onClick={() => { setActiveNiche('ambient'); setIdeas([]); setTopic(''); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeNiche === 'ambient' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Headphones className="w-4 h-4" />
              Эмбиент и Медитация
            </button>
          </div>
        </div>

        {/* Hero / Search Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            {activeNiche === 'psychology' ? 'Найдите Идею для Вирусного Видео' : 'Создайте Эмбиент-Контент с Высоким RPM'}
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            {activeNiche === 'psychology' 
              ? 'Введите тему по психологии или нейробиологии, и наш ИИ сгенерирует идеи для видео, кликабельные названия и полные сценарии.'
              : 'Введите настроение, частоту или окружение. Наш ИИ сгенерирует концепции для 2-8 часовых лупов, советы по звуку и визуальные стратегии.'}
          </p>

          <form onSubmit={handleGenerateIdeas} className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={activeNiche === 'psychology' ? "напр., Как травма влияет на память..." : "напр., Дождь в Токио ночью для глубокого сна..."}
                className="w-full pl-12 pr-32 py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              />
              <Button 
                type="submit" 
                disabled={isGeneratingIdeas || !topic.trim()}
                className="absolute right-2 h-[calc(100%-16px)]"
              >
                {isGeneratingIdeas ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Сгенерировать
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Presets */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-slate-500 py-1.5 mr-2">В тренде:</span>
            {PRESETS[activeNiche].map((preset) => (
              <button
                key={preset}
                onClick={() => setTopic(preset)}
                className={`px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium transition-colors shadow-sm ${
                  activeNiche === 'psychology' 
                    ? 'text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                    : 'text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {ideas.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Ideas List */}
            <div className={`lg:col-span-5 space-y-4 ${selectedIdea ? 'hidden md:block' : 'block'}`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900">Сгенерированные Идеи</h2>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {ideas.length} результатов
                </span>
              </div>
              
              <div className="space-y-4">
                {ideas.map((idea, idx) => (
                  <IdeaCard 
                    key={idx} 
                    idea={idea} 
                    isSelected={selectedIdea?.title === idea.title}
                    onSelect={handleSelectIdea} 
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Video Planner */}
            {(selectedIdea || isGeneratingPlan) && (
              <div className="lg:col-span-7 lg:sticky lg:top-24">
                <VideoPlanner 
                  planMarkdown={planMarkdown} 
                  isLoading={isGeneratingPlan} 
                  onBack={() => setSelectedIdea(null)}
                  idea={selectedIdea}
                  niche={activeNiche}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
