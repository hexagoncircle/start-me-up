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
    colorBg: ({ theme }) => {
      return {
        1: theme("colors").white[100],
        2: theme("colors").white[200],
        success: theme("colors")["bubble-gum"],
      };
    },
    colorText: ({ theme }) => {
      return {
        1: theme("colors").bermuda,
        2: theme("colors").silver,
      };
    },
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
    space: ({ theme }) => theme("spacing"),
  },
};
