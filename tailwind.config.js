export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Archivo', 'system-ui', 'sans-serif'] },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
        float: { '0%,100%': { transform: 'rotate(-14deg) translateY(0)' }, '50%': { transform: 'rotate(-14deg) translateY(-14px)' } },
      },
      animation: { 'fade-up': 'fade-up .6s ease both', float: 'float 6s ease-in-out infinite' },
    },
  },
  plugins: [],
}
