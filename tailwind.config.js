/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#18211D",
        muted: "#66726B",
        canvas: "#FFFFFF",
        surface: "#FFFFFF",
        line: "#DFE6DD",
        primary: "#332FDB",
        "primary-dark": "#2520B8",
        "primary-soft": "#ECEBFF",
        brand: {
          50: "#F4F3FF",
          100: "#ECEBFF",
          300: "#8E8AFC",
          500: "#332FDB",
          700: "#2520B8",
          900: "#14106E",
        },
        signal: {
          amber: "#F3B44E",
          coral: "#EF746F",
          blue: "#4E83F1",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
