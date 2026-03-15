'use client';

export default function Chart({ data, type = 'bar', title }) {
  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-8 text-blue-400">
        No data available
      </div>
    );
  }

  if (type === 'bar') {
    const maxValue = Math.max(...data.map(d => d.value), 1); // avoid division by zero
    return (
      <div className="card">
        {title && <h3 className="text-lg font-semibold mb-4 text-blue-900">{title}</h3>}
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-blue-700">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-blue-900">
                  {item.value}
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF'];

    // When all values are 0, show an empty ring with a placeholder message
    if (total === 0) {
      return (
        <div className="card">
          {title && <h3 className="text-lg font-semibold mb-4 text-blue-900">{title}</h3>}
          <div className="flex items-center gap-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#DBEAFE" strokeWidth="20" />
              </svg>
              <span className="absolute text-xs text-blue-400">No data</span>
            </div>
            <div className="flex-1 space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="text-sm text-blue-700">{item.label}: 0 (0%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="card">
        {title && <h3 className="text-lg font-semibold mb-4 text-blue-900">{title}</h3>}
        <div className="flex items-center gap-6">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const offset = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0);
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="20"
                    strokeDasharray={`${percentage * 2.51} ${251 - percentage * 2.51}`}
                    strokeDashoffset={-offset * 2.51}
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-blue-700">
                  {item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
