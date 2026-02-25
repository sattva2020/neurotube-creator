import React from 'react';
import { VideoIdea } from '../services/geminiService';
import { Button } from './Button';
import { Brain, TrendingUp, Users, PlayCircle, Tag, Twitter, Facebook, Linkedin, Share2 } from 'lucide-react';

interface IdeaCardProps {
  idea: VideoIdea;
  onSelect: (idea: VideoIdea) => void;
  isSelected: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onSelect, isSelected }) => {
  return (
    <div 
      className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-1 ring-indigo-500' 
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
      }`}
      onClick={() => onSelect(idea)}
    >
      <h3 className="text-xl font-semibold text-slate-900 mb-3 leading-tight">
        {idea.title}
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <TrendingUp className="w-3 h-3 mr-1" />
          {idea.searchVolume}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Users className="w-3 h-3 mr-1" />
          {idea.targetAudience}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {idea.primaryKeyword && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
            <Tag className="w-3 h-3 mr-1" />
            {idea.primaryKeyword}
          </span>
        )}
        {idea.secondaryKeywords?.map((kw, idx) => (
          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {kw}
          </span>
        ))}
      </div>

      <div className="space-y-3 text-sm text-slate-600">
        <div>
          <strong className="text-slate-900 flex items-center gap-1.5 mb-1">
            <PlayCircle className="w-4 h-4 text-indigo-500" /> Хук:
          </strong>
          <p className="italic border-l-2 border-indigo-200 pl-3 py-1">"{idea.hook}"</p>
        </div>
        
        <div>
          <strong className="text-slate-900 flex items-center gap-1.5 mb-1">
            <Brain className="w-4 h-4 text-indigo-500" /> Почему это сработает:
          </strong>
          <p>{idea.whyItWorks}</p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3">
        {!isSelected && (
          <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
            e.stopPropagation();
            onSelect(idea);
          }}>
            Сгенерировать сценарий и обложку
          </Button>
        )}
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> Поделиться идеей
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const text = `Думаю снять видео на эту тему: "${idea.title}"\n\nХук: ${idea.hook}\n\nСгенерировано через NeuroTube Creator 🧠`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="p-1.5 hover:bg-slate-100 hover:text-[#1DA1F2] rounded-md transition-colors"
              title="Share on Twitter"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const url = window.location.href;
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
              }}
              className="p-1.5 hover:bg-slate-100 hover:text-[#1877F2] rounded-md transition-colors"
              title="Share on Facebook"
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const url = window.location.href;
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
              }}
              className="p-1.5 hover:bg-slate-100 hover:text-[#0A66C2] rounded-md transition-colors"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
