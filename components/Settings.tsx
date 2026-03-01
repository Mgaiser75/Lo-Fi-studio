
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, CreditCard, Bell, Database, Key, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { AIModelCapability, AIProvider, ModelConfig } from '../types';
import { getModelConfig, saveModelConfig } from '../lib/storage';

export const Settings: React.FC = () => {
  const [config, setConfig] = useState<ModelConfig>(getModelConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = () => {
    setIsSaving(true);
    try {
      saveModelConfig(config);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateApiKey = (provider: AIProvider, key: string) => {
    setConfig(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [provider]: key }
    }));
  };

  const sections = [
    { id: 'models', icon: <Database className="w-5 h-5" />, title: 'AI Model Architecture', desc: 'Configure smart model selectors for each production step.' },
    { id: 'keys', icon: <Key className="w-5 h-5" />, title: 'API Credentials', desc: 'Manage keys for OpenAI, Mistral, DeepSeek, and more.' },
    { id: 'security', icon: <Shield className="w-5 h-5" />, title: 'Account Security', desc: 'Personal tool mode enabled. No remote authentication required.' },
  ];

  const [activeSection, setActiveSection] = useState('models');

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Studio Config</h2>
          <p className="text-slate-400">Fine-tune your AI production pipeline and model preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-black transition-all shadow-xl ${
            saveStatus === 'success' 
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' 
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : saveStatus === 'success' ? <Save className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          <span>{isSaving ? 'Saving...' : saveStatus === 'success' ? 'Config Saved' : 'Save Changes'}</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Nav */}
        <div className="lg:col-span-4 space-y-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-start space-x-5 p-5 rounded-3xl border transition-all text-left group ${
                activeSection === section.id 
                  ? 'bg-slate-900 border-slate-700 shadow-xl' 
                  : 'bg-transparent border-transparent hover:bg-slate-900/40 opacity-60 hover:opacity-100'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-colors ${
                activeSection === section.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:text-amber-500'
              }`}>
                {section.icon}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{section.title}</h3>
                <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">{section.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 lg:p-10 shadow-2xl">
          {activeSection === 'models' && (
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Database className="text-amber-500" size={20} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Model Selection</h3>
                </div>
                
                <div className="space-y-8">
                  <section className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Text & Reasoning Engine</label>
                    <ModelSelector 
                      capability={AIModelCapability.TEXT}
                      selectedModelId={config.textModelId}
                      onSelect={(id) => setConfig(prev => ({ ...prev, textModelId: id }))}
                    />
                  </section>

                  <section className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Visual Generation (Images)</label>
                    <ModelSelector 
                      capability={AIModelCapability.IMAGE}
                      selectedModelId={config.imageModelId}
                      onSelect={(id) => setConfig(prev => ({ ...prev, imageModelId: id }))}
                    />
                  </section>

                  <section className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Video Production (Veo/Sora)</label>
                    <ModelSelector 
                      capability={AIModelCapability.VIDEO}
                      selectedModelId={config.videoModelId}
                      onSelect={(id) => setConfig(prev => ({ ...prev, videoModelId: id }))}
                    />
                  </section>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'keys' && (
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <Key className="text-amber-500" size={20} />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">API Management</h3>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-3xl flex items-start space-x-4">
                <AlertCircle className="text-amber-500 shrink-0 mt-1" size={18} />
                <p className="text-xs text-slate-400 leading-relaxed">
                  API keys are stored <b>locally in your browser</b>. They are never sent to our servers. Gemini API is the default and recommended provider for this studio.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {Object.values(AIProvider).map((provider) => (
                  <div key={provider} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{provider} API Key</label>
                    <div className="relative">
                      <input 
                        type="password"
                        value={config.apiKeys[provider] || ''}
                        onChange={(e) => updateApiKey(provider, e.target.value)}
                        placeholder={`Enter your ${provider} key...`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-amber-500/50 transition-all font-mono"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700">
                        <Key size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="p-8 bg-slate-950 rounded-full border border-slate-800">
                <Shield className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="max-w-sm">
                <h4 className="text-xl font-bold text-white">Edge-Only Security</h4>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  LoFi Studio operates entirely on your device. Your tracks, mixes, and API keys never leave your browser's local storage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
