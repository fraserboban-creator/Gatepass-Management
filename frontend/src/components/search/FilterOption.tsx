'use client';

import { Check } from 'lucide-react';

interface FilterOptionProps {
  label: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  type?: 'checkbox' | 'radio';
}

export default function FilterOption({
  label,
  value,
  checked,
  onChange,
  type = 'checkbox',
}: FilterOptionProps) {
  return (
    <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
      <div className="relative flex items-center justify-center">
        <input
          type={type}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded ${
            type === 'radio' ? 'rounded-full' : 'rounded-md'
          } border-2 transition-all duration-200 ${
            checked
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 group-hover:border-gray-400'
          }`}
        >
          {checked && (
            <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>
      <span className="text-sm text-gray-700 select-none">
        {label}
      </span>
    </label>
  );
}
