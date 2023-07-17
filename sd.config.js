/**
 * Generate CSS custom properties from tailwind config using style dictionary
 * {@link https://dev.to/philw_/using-style-dictionary-to-transform-tailwind-config-into-scss-variables-css-custom-properties-and-javascript-via-design-tokens-24h5#getting-tailwind-config-data-into-the-right-format-for-style-dictionary}
 */
const resolveConfig = require("tailwindcss/resolveConfig");
const tailwindConfig = require("./tailwind.config.js");
const _ = require("lodash");

// Set the token categories that will appear in the CSS output.
const categories = ["colorBg", "colorText", "space", "fontFamily"];

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
  const hasUpdatedKey = categories.find((category) => category[key]);
  let categoryName = key;

  if (hasUpdatedKey) {
    categoryName = Object.values(hasUpdatedKey)[0];
    console.log(categoryName);
  }

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

module.exports = {
  tokens,
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "src/css/",
      files: [
        {
          format: "css/variables",
          destination: "_variables.css",
          filter: (token) => categories.includes(token.attributes.category),
        },
      ],
    },
  },
};
