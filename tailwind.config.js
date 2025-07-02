    /** @type {import('tailwindcss').Config} */
    const colors = require('tailwindcss/colors'); // Import default colors for explicit extension

    module.exports = {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // This covers all your React components
      ],
      theme: {
        extend: {
          // Explicitly extend colors to ensure all default shades are available,
          // including gray-950 which is part of Tailwind's extended gray palette.
          colors: {
            gray: colors.gray,
            // You can explicitly add other default colors if you plan to use them
            // blue: colors.blue,
            // green: colors.green,
            // red: colors.red,
            // yellow: colors.yellow,
            // purple: colors.purple,
            // cyan: colors.cyan,
            // amber: colors.amber,
            // indigo: colors.indigo,
            // teal: colors.teal,
          },
        },
      },
      plugins: [
        require('tailwindcss-animate'), // Essential for shadcn/ui animations
      ],
    }
    