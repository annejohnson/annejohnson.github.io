const { DateTime } = require('luxon');

// From: https://stackoverflow.com/a/72416685
//
// Add a friendly date filter to nunjucks.
// Defaults to format of LLLL d, y unless an
// alternate is passed as a parameter.
// {{ date | friendlyDate('OPTIONAL FORMAT STRING') }}
// List of supported tokens: https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens

module.exports = (dateObj, format = 'LLLL d, y') => {
  return DateTime.fromJSDate(dateObj, { zone: 'Europe/Berlin' }).toFormat(format);
};