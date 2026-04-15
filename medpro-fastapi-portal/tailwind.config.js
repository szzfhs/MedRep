/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Clinical Nexus 设计系统配色
        primary: '#003f87',
        'primary-container': '#0056b3',
        'on-primary': '#ffffff',
        'on-primary-container': '#bbd0ff',
        'primary-fixed': '#d7e2ff',
        'primary-fixed-dim': '#acc7ff',
        'inverse-primary': '#acc7ff',
        secondary: '#48626e',
        'secondary-container': '#cbe7f5',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#4e6874',
        tertiary: '#722b00',
        'tertiary-container': '#983c00',
        'on-tertiary': '#ffffff',
        background: '#f8f9fa',
        'on-background': '#191c1d',
        surface: '#f8f9fa',
        'on-surface': '#191c1d',
        'surface-variant': '#e1e3e4',
        'on-surface-variant': '#424752',
        'surface-container': '#edeeef',
        'surface-container-low': '#f3f4f5',
        'surface-container-high': '#e7e8e9',
        'surface-container-highest': '#e1e3e4',
        'surface-container-lowest': '#ffffff',
        'surface-tint': '#115cb9',
        'surface-dim': '#d9dadb',
        'surface-bright': '#f8f9fa',
        outline: '#727784',
        'outline-variant': '#c2c6d4',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        'inverse-surface': '#2e3132',
        'inverse-on-surface': '#f0f1f2'
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem'
      },
      fontFamily: {
        headline: ['Manrope', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', 'sans-serif'],
        body: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', 'sans-serif'],
        label: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', 'sans-serif']
      }
    }
  },
  plugins: []
}
