// Theme utility functions
export const THEME_COLORS = {
  blue: { 
    primary: '#3B82F6', 
    hover: '#2563EB',
    gradient: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-600'
  },
  purple: { 
    primary: '#A855F7', 
    hover: '#9333EA',
    gradient: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-600'
  },
  green: { 
    primary: '#10B981', 
    hover: '#059669',
    gradient: 'from-green-50 to-green-100',
    border: 'border-green-200',
    text: 'text-green-600'
  },
  red: { 
    primary: '#EF4444', 
    hover: '#DC2626',
    gradient: 'from-red-50 to-red-100',
    border: 'border-red-200',
    text: 'text-red-600'
  }
};

export const applyTheme = (themeName) => {
  const theme = THEME_COLORS[themeName];
  if (!theme) return;

  // Update CSS variables
  document.documentElement.style.setProperty('--accent-primary', theme.primary);
  document.documentElement.style.setProperty('--accent-hover', theme.hover);
  
  // Store theme in body data attribute
  document.body.setAttribute('data-theme', themeName);
  
  // Dispatch custom event for components to listen
  window.dispatchEvent(new CustomEvent('themeChange', { 
    detail: { theme: themeName } 
  }));
};

export const getTheme = () => {
  if (typeof window === 'undefined') return 'blue';
  return localStorage.getItem('theme_color') || 'blue';
};

export const saveTheme = (themeName) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme_color', themeName);
  applyTheme(themeName);
};

export const initializeTheme = () => {
  if (typeof window === 'undefined') return;
  const savedTheme = getTheme();
  applyTheme(savedTheme);
};
