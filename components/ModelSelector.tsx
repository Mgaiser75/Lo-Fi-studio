import React, { useMemo } from 'react';
import { AIModel, AIModelCapability, AIProvider } from '../types';
import { AVAILABLE_MODELS } from '../constants';
import { Check, Info, DollarSign, Zap, Cpu, Video, Music as MusicIcon, Type as TextIcon } from 'lucide-react';

interface ModelSelectorProps {
  capability: AIModelCapability;
  selectedModelId: string;
  onSelect: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  capability,
  selectedModelId,
  onSelect
}) => {
  const filteredModels = useMemo(() => 
    AVAILABLE_MODELS.filter(m => m.capabilities.includes(capability)),
    [capability]
  );

  const getCapabilityIcon = (cap: AIModelCapability) => {
    switch (cap) {
      case AIModelCapability.TEXT: return <TextIcon size={14} />;
      case AIModelCapability.IMAGE: return <Zap size={14} />;
      case AIModelCapability.VIDEO: return <Video size={14} />;
      case AIModelCapability.AUDIO: return <MusicIcon size={14} />;
      default: return <Cpu size={14} />;
    }
  };

  const getCostDisplay = (model: AIModel) => {
    if (model.costPer1kTokens !== undefined) {
      return `$${(model.costPer1kTokens * 1000).toFixed(4)} / 1M tokens`;
    }
    if (model.costPerImage !== undefined) {
      return `$${model.costPerImage.toFixed(3)} / image`;
    }
    if (model.costPerVideoMinute !== undefined) {
      return `$${model.costPerVideoMinute.toFixed(2)} / min`;
    }
    return 'Free / Local';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredModels.map((model) => {
        const isSelected = model.id === selectedModelId;
        return (
          <div
            key={model.id}
            onClick={() => onSelect(model.id)}
            className={`relative p-5 rounded-2xl border transition-all cursor-pointer group ${
              isSelected 
                ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5' 
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {getCapabilityIcon(capability)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{model.name}</h4>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">{model.provider}</span>
                </div>
              </div>
              {isSelected && (
                <div className="bg-amber-500 rounded-full p-1">
                  <Check size={12} className="text-slate-950" />
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
              {model.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
              <div className="flex items-center space-x-1.5 text-slate-500">
                <DollarSign size={12} className="text-emerald-500" />
                <span className="text-[10px] font-mono">{getCostDisplay(model)}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Info size={14} className="text-slate-600" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
