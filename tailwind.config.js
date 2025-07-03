/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all your component files
    "./node_modules/@solana/wallet-adapter-react-ui/lib/**/*.{js,jsx,ts,tsx}" // Scans the wallet adapter components
  ],
  theme: {
    extend: {
      fontFamily: {
        // Adding custom fonts to use in the app
        sans: ['Poppins', 'sans-serif'],
        'slab': ['Roboto Slab', 'serif'],
      },
    },
  },
  plugins: [],
}
