/**
 * Generate CSS custom properties from tailwind config using style dictionary
 * {@link https://dev.to/philw_/using-style-dictionary-to-transform-tailwind-config-into-scss-variables-css-custom-properties-and-javascript-via-design-tokens-24h5#getting-tailwind-config-data-into-the-right-format-for-style-dictionary}
 */
const StyleDictionary = require("style-dictionary");
const resolveConfig = require("tailwindcss/resolveConfig");
const tailwindConfig = require("./tailwind.config.js");
const _ = require("lodash");

// Set the token categories that will appear in the CSS output.
// const categories = ["colorBg", "colorText", "space", "fontFamily"];

// Grab just the theme data from the Tailwind config.
const { theme } = resolveConfig(tailwindConfig);

// Create an empty object to hold our transformed tokens data.
const tokens = {};

// A helper function that uses Lodash's setWith method to
// insert things into an object at the right point in the
// structure, and to create the right structure for us
// if it doesn't already exist.
const addToTokensObject = function (position, value) {
  _.setWith(tokens, position, { value: value }, Object);
};

// Loop over the theme data…
_.forEach(theme, function (value, key) {
  switch (key) {
    case "fontFamily":
      // Font family data is in an array, so we use join to
      // turn the font families into a single string.
      _.forEach(theme["fontFamily"], function (value, key) {
        addToTokensObject(
          ["fontFamily", key],
          theme["fontFamily"][key].join(",")
        );
      });
      break;

    case "fontSize":
      // Font size data contains both the font size (makes
      // sense!) but also a recommended line-length, so we
      // create two tokens for every font size, one for the
      // font-size value and one for the line-height.
      _.forEach(theme["fontSize"], function (value, key) {
        addToTokensObject(["fontSize", key], value[0]);
        addToTokensObject(
          ["fontSize", `${key}--lineHeight`],
          value[1]["lineHeight"]
        );
      });
      break;

    default:
      _.forEach(value, function (value, secondLevelKey) {
        if (!_.isObject(value)) {
          // For non-objects (simple key/value pairs) we can
          // add them straight into our tokens object.
          addToTokensObject([key, secondLevelKey], value);
        } else {
          // Skip 'raw' CSS media queries.
          if (!_.isUndefined(value["raw"])) {
            return;
          }

          // For objects (like color shades) we need to do a
          // final forOwn loop to make sure we add everything
          // in the right format.
          _.forEach(value, function (value, thirdLevelKey) {
            addToTokensObject([key, secondLevelKey, thirdLevelKey], value);
          });
        }
      });
      break;
  }
});

/**
 * This function will wrap a built-in format and replace `.value` with `.darkValue`
 * if a token has a `.darkValue`.
 * @param {String} format - the name of the built-in format
 * @returns {Function}
 */
function darkFormatWrapper(format) {
  return function (args) {
    const dictionary = Object.assign({}, args.dictionary);

    // Override each token's `value` with `darkValue`
    dictionary.allProperties = dictionary.allProperties.map((token) => {
      const { darkValue } = token;
      if (darkValue) {
        return Object.assign({}, token, {
          value: token.darkValue,
        });
      } else {
        return token;
      }
    });

    // Use the built-in format but with our customized dictionary object
    // so it will output the darkValue instead of the value
    return StyleDictionary.format[format]({ ...args, dictionary });
  };
}

const categories = ["color", "size"];

const filesConfig = categories.map((category) => ({
  destination: `tokens/_${category}.css`,
  format: "css/variables",
  filter: (token) => {
    if (token.attributes.category === category) {
      return token.attributes.type !== "base" ? token : null;
    }
  },
}));

const filesConfigDark = categories.map((category) => ({
  destination: `tokens/_${category}.dark.css`,
  format: "cssDark",
  filter: (token) => {
    if (
      token.attributes.category === category &&
      token.darkValue &&
      token.attributes.category === `color`
    ) {
      return token.attributes.type !== "base" ? token : null;
    }
  },
  options: {
    selector: "[data-theme='dark']",
  },
}));

module.exports = {
  format: {
    cssDark: darkFormatWrapper(`css/variables`),
  },
  source: [`./src/_tokens/**/*.json`],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "src/css/",
      files: [...filesConfig, ...filesConfigDark],
    },
  },
};
