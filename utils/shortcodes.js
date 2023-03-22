const metadata = require("../src/_data/metadata");

module.exports = {
  metadataOGImage: (imagePath) =>
    metadata.url + (imagePath || metadata.ogImage),

  metadataPageTitle: (title) =>
    (title || metadata.title) + " | " + metadata.siteName,
};
