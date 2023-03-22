const { DateTime } = require("luxon");

module.exports = {
  postDate: (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_FULL);
  },

  year: () => new Date().getFullYear(),
};
