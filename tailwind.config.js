const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.webc"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: {
        100: "#ffffff",
        200: "#f3f3f3",
      },
      purple: "#3f3cbb",
      midnight: "#121063",
      metal: "#565584",
      tahiti: "#3ab7bf",
      silver: "#ecebff",
      "bubble-gum": "#ff77e9",
      bermuda: "#78dcca",
    },
    backgroundColor: ({ theme }) => theme("colors"),
    textColor: ({ theme }) => theme("colors"),
    fontFamily: {
      sans: ["system-ui", "sans-serif"],
      serif: ["Georgia", "serif"],
    },
    spacing: {
      "2xs": "0.25rem",
      xs: "0.5rem",
      s: "0.75rem",
      m: "1rem",
      l: "2rem",
      xl: "4rem",
      "2xl": "6rem",
      "3xl": "8rem",
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      function extractVars(obj, prefix) {
        return Object.keys(obj).reduce((vars, key) => {
          const value = obj[key];
          const cssVariable =
            key === "DEFAULT" ? `--${prefix}` : `--${prefix}-${key}`;

          const newVars =
            typeof value === "string"
              ? { [cssVariable]: value }
              : extractVars(value, `-${key}`, prefix);

          return { ...vars, ...newVars };
        }, {});
      }

      addUtilities({
        ":root": {
          ...extractVars(theme("colors"), "color", "cool"),
          ...extractVars(theme("spacing"), "space"),
        },
      });
    }),
  ],
};
