/**
 * Convert design tokens to CSS variables using Style Dictionary.
 * {@link https://amzn.github.io/style-dictionary/}
 * {@link https://dbanks.design/blog/dark-mode-with-style-dictionary/}
 */
const StyleDictionary = require("style-dictionary");
const fs = require("fs-extra");

const tokensPath = "src/_tokens/";
const buildPath = "src/css/tokens/";
const categories = {
  default: ["color", "size"],
  dark: ["color"],
};
const modes = ["light", "dark"];
const transforms = ["attribute/cti", "name/cti/kebab", "sizes/pxToRem"];

StyleDictionary.registerTransform({
  name: "sizes/pxToRem",
  type: "value",
  matcher: ({ attributes: { category } }) => ["size"].includes(category),
  transformer: ({ value }) => `${(1 / 16) * value}rem`,
});

// Clean out the tokens directory
console.log(`🧹 Cleaning up ${buildPath}`);
fs.removeSync(buildPath);

// Default (light) mode
console.log(`\n🌞 Building default/light mode`);
StyleDictionary.extend({
  source: [`${tokensPath}**/!(*.${modes.join(`|*.`)}).json`],
  platforms: {
    css: {
      transformGroup: "css",
      transforms,
      buildPath,
      files: categories.default.map((category) => {
        let selector = `:where(html)${
          category === "color" ? ", :where([data-theme])" : ""
        }`;

        return {
          destination: `_${category}.css`,
          format: "css/variables",
          filter: (token) => token.attributes.category === category,
          options: {
            selector,
          },
        };
      }),
    },
  },
}).buildAllPlatforms();

// Dark mode
console.log(`\n🌛 Building dark mode`);
StyleDictionary.extend({
  include: [`${tokensPath}**/!(*.${modes.join(`|*.`)}).json`],
  source: [`${tokensPath}**/*.dark.json`],
  platforms: {
    css: {
      transformGroup: "css",
      transforms,
      buildPath,
      files: categories.dark.map((category) => ({
        destination: `_${category}.dark.css`,
        format: "css/variables",
        filter: (token) =>
          token.filePath.indexOf(".dark") > -1 &&
          token.attributes.category === category,
        options: {
          selector: ":where([data-theme='dark'])",
        },
      })),
    },
  },
}).buildAllPlatforms();
