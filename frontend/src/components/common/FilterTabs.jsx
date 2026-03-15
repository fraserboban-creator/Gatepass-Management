'use client';

export default function FilterTabs({ tabs, activeTab, onTabChange, className = '' }) {
  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === tab.value
              ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeTab === tab.value
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
