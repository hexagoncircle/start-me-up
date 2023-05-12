const path = require("node:path");
const pluginWebc = require("@11ty/eleventy-plugin-webc");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const { bundle, transform } = require("lightningcss");
const { Buffer } = require("node:buffer");
const filters = require("./utils/filters");
const shortcodes = require("./utils/shortcodes");
const lightningCssConfig = require("./utils/lightning-css-config");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(pluginWebc, {
    components: "src/_includes/**/*.webc",
  });

  eleventyConfig.addPlugin(pluginBundle, {
    transforms: [
      async function (content) {
        if (this.type === "css") {
          let { code } = transform({
            ...lightningCssConfig,
            code: Buffer.from(content),
          });
          return code;
        }
        return content;
      },
    ],
  });

  eleventyConfig.addTemplateFormats("css");
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async function (_inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) {
        return;
      }

      return async () => {
        let { code } = bundle({
          ...lightningCssConfig,
          filename: inputPath,
        });
        return code;
      };
    },
  });

  Object.keys(filters).forEach((filter) => {
    eleventyConfig.addFilter(filter, filters[filter]);
  });

  Object.keys(shortcodes).forEach((shortcode) => {
    eleventyConfig.addShortcode(shortcode, shortcodes[shortcode]);
  });

  eleventyConfig.addLayoutAlias("base", "base.webc");
  eleventyConfig.addLayoutAlias("page", "page.webc");

  eleventyConfig.addPassthroughCopy({
    "./public/": "/",
  });

  eleventyConfig.setServerOptions({
    showAllHosts: true,
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
  };
};
