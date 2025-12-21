import { FormEvent } from 'react';
import { Search, BrainCircuit, Send } from 'lucide-react';

import { ChatMessage } from '../types';
import { GlassCard } from './GlassCard';
import { ProgressBar } from './ProgressBar';

interface RAGTabProps {
    ragStatus: string;
    chatInput: string;
    setChatInput: (value: string) => void;
    chatHistory: ChatMessage[];
    isQuerying: boolean;
    onRagQuery: (e: FormEvent) => void;
    modelLoadingProgress: number;
    isModelLoading: boolean;
    canSearch: boolean;
    documentCount: number;
}

export const RAGTab: React.FC<RAGTabProps> = ({
    ragStatus,
    chatInput,
    setChatInput,
    chatHistory,
    isQuerying,
    onRagQuery,
    modelLoadingProgress,
    isModelLoading,
    canSearch,
    documentCount
}) => (
  <GlassCard className="p-6 flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-white/40"><Search size={18}/> RAG Knowledge Assistant</h3>
          <div className={`px-3 py-1.5 rounded-full text-[9px] font-bold border ${
            canSearch 
              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {canSearch ? `${documentCount} Document${documentCount !== 1 ? 's' : ''} Ready` : ragStatus}
          </div>
      </div>
      {isModelLoading && (
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center text-[10px] text-white/60">
            <span>Loading text generation model...</span>
            <span>{Math.round(modelLoadingProgress * 100)}%</span>
          </div>
          <ProgressBar progress={modelLoadingProgress * 100} color="bg-indigo-500" />
        </div>
      )}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-12">
                <BrainCircuit size={56} className="mb-4 text-blue-400" />
                <p className="text-sm font-bold">Vector Store {canSearch ? 'Ready' : 'Standby'}</p>
                <p className="text-[10px] mt-2 italic px-8">
                    {canSearch 
                        ? `Your knowledge base contains ${documentCount} document${documentCount !== 1 ? 's' : ''}. Ask a question to search.`
                        : 'Upload and index documents to build your knowledge base.'}
                </p>
            </div>
          ) : (
            chatHistory.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-3xl text-xs leading-relaxed max-w-[85%] ${
                    m.role === 'user'
                      ? 'bg-blue-600 rounded-tr-none shadow-xl'
                      : 'bg-white/5 border border-white/10 rounded-tl-none backdrop-blur-sm shadow-lg'
                  }`}>
                      {m.content}
                  </div>
              </div>
            ))
          )}
          {isQuerying && (
            <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none flex gap-1.5 animate-pulse">
                    <div className="w-2 h-2 bg-blue-400/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400/40 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-400/40 rounded-full animate-bounce delay-200" />
                </div>
            </div>
          )}
      </div>
      <form onSubmit={onRagQuery} className="flex gap-3 shrink-0">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={!canSearch}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-white/10 disabled:opacity-50"
            placeholder={canSearch ? "Query your knowledge base..." : "Index documents to start searching"}
          />
          <button
            type="submit"
            disabled={!chatInput || isQuerying || !canSearch}
            className="p-4 bg-blue-600 hover:bg-blue-500 cursor-pointer active:scale-90 rounded-2xl transition-all disabled:opacity-20 shadow-lg shadow-blue-900/20"
          >
              <Send size={22}/>
          </button>
      </form>
  </GlassCard>
);

