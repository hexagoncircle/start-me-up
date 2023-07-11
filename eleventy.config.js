const pluginWebc = require("@11ty/eleventy-plugin-webc");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const filters = require("./utils/filters");
const shortcodes = require("./utils/shortcodes");
const tailwind = require("tailwindcss");
const postcss = require("postcss");
const postcssImport = require("postcss-import");
const postcssMixins = require("postcss-mixins");

const postcssPlugins = [tailwind, postcssImport, postcssMixins];

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(pluginWebc, {
    components: "src/_includes/**/*.webc",
  });

  eleventyConfig.addPlugin(pluginBundle, {
    transforms: [
      async function (content) {
        if (this.type === "css") {
          let result = await postcss(postcssPlugins).process(content, {
            from: this.page.inputPath,
            to: null,
          });
          return result.css;
        }

        return content;
      },
    ],
  });

  eleventyConfig.addTemplateFormats("css");
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async function (inputContent, inputPath) {
      if (inputPath !== "./src/css/global.css") {
        return;
      }

      return async () => {
        let output = await postcss(postcssPlugins).process(inputContent, {
          from: inputPath,
        });

        return output.css;
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
