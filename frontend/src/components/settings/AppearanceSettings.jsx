'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Palette, Save } from 'lucide-react';
import { getTheme, saveTheme, applyTheme } from '@/lib/theme';

export default function AppearanceSettings() {
  const [settings, setSettings] = useState({
    theme_color: 'blue',
    interface_density: 'comfortable'
  });
  const [saving, setSaving] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = getTheme();
    const savedDensity = localStorage.getItem('interface_density') || 'comfortable';
    setSettings({
      theme_color: savedTheme,
      interface_density: savedDensity
    });
    applyTheme(savedTheme);
  }, []);

  const themeColors = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500', primaryColor: '#3B82F6', hoverColor: '#2563EB', gradient: 'from-blue-50 to-blue-100' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500', primaryColor: '#A855F7', hoverColor: '#9333EA', gradient: 'from-purple-50 to-purple-100' },
    { value: 'green', label: 'Green', color: 'bg-green-500', primaryColor: '#10B981', hoverColor: '#059669', gradient: 'from-green-50 to-green-100' },
    { value: 'red', label: 'Red', color: 'bg-red-500', primaryColor: '#EF4444', hoverColor: '#DC2626', gradient: 'from-red-50 to-red-100' }
  ];

  const handleThemeChange = (themeColor) => {
    console.log('Theme changing to:', themeColor);
    setSettings({ ...settings, theme_color: themeColor });
    applyTheme(themeColor);
    toast.success(`Theme changed to ${themeColor}!`, { duration: 2000 });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save theme using utility function
      saveTheme(settings.theme_color);
      
      // Save interface density
      localStorage.setItem('interface_density', settings.interface_density);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Appearance settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Palette size={24} className="text-blue-600" />
        Appearance Settings
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Theme Color
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themeColors.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                className="p-4 rounded-lg border-2 transition-all"
                style={{
                  borderColor: settings.theme_color === theme.value ? theme.primaryColor : '#e5e7eb',
                  backgroundColor: settings.theme_color === theme.value ? `${theme.primaryColor}10` : 'transparent',
                  boxShadow: settings.theme_color === theme.value ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none'
                }}
              >
                <div className={`w-12 h-12 ${theme.color} rounded-full mx-auto mb-2 shadow-lg`}></div>
                <p className="text-sm font-medium text-gray-900">{theme.label}</p>
                {settings.theme_color === theme.value && (
                  <p className="text-xs mt-1" style={{ color: theme.primaryColor }}>✓ Active</p>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Select a theme color to personalize your dashboard
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Interface Density
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSettings({ ...settings, interface_density: 'compact' })}
              className="p-4 rounded-lg border-2 transition-all"
              style={{
                borderColor: settings.interface_density === 'compact' ? themeColors.find(t => t.value === settings.theme_color)?.primaryColor : '#e5e7eb',
                backgroundColor: settings.interface_density === 'compact' ? `${themeColors.find(t => t.value === settings.theme_color)?.primaryColor}10` : 'transparent',
                boxShadow: settings.interface_density === 'compact' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none'
              }}
            >
              <p className="font-medium text-gray-900">Compact</p>
              <p className="text-sm text-gray-600">More content, less spacing</p>
              {settings.interface_density === 'compact' && (
                <p className="text-xs mt-1" style={{ color: themeColors.find(t => t.value === settings.theme_color)?.primaryColor }}>✓ Active</p>
              )}
            </button>

            <button
              onClick={() => setSettings({ ...settings, interface_density: 'comfortable' })}
              className="p-4 rounded-lg border-2 transition-all"
              style={{
                borderColor: settings.interface_density === 'comfortable' ? themeColors.find(t => t.value === settings.theme_color)?.primaryColor : '#e5e7eb',
                backgroundColor: settings.interface_density === 'comfortable' ? `${themeColors.find(t => t.value === settings.theme_color)?.primaryColor}10` : 'transparent',
                boxShadow: settings.interface_density === 'comfortable' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none'
              }}
            >
              <p className="font-medium text-gray-900">Comfortable</p>
              <p className="text-sm text-gray-600">Balanced spacing</p>
              {settings.interface_density === 'comfortable' && (
                <p className="text-xs mt-1" style={{ color: themeColors.find(t => t.value === settings.theme_color)?.primaryColor }}>✓ Active</p>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
