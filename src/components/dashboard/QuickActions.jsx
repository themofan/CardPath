import React from 'react';
import { Search, GitBranch, Zap, MessageSquare } from 'lucide-react';

const ACTIONS = [
  { id: 'explorer', label: 'Explore Cards', icon: Search },
  { id: 'pathgraph', label: 'View Path', icon: GitBranch },
  { id: 'simulator', label: 'Simulator', icon: Zap },
  { id: 'advisor', label: 'Ask AI', icon: MessageSquare },
];

export default function QuickActions({ onNavigate }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ACTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className="flex flex-col items-center gap-2 bg-[#3A322C] border border-primary/30 rounded-xl p-4 cursor-pointer hover:bg-accent hover:border-primary transition-all"
        >
          <Icon className="w-5 h-5 text-primary" />
          <span className="text-primary text-xs font-semibold">{label}</span>
        </button>
      ))}
    </div>
  );
}
