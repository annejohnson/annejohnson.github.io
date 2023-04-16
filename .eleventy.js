const sass = require('sass');

module.exports = function(eleventyConfig) {
  eleventyConfig.addTemplateFormats('scss');

  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',

    // `compile` is called once per .scss file in the input directory
    compile: async function(inputContent) {
      let result = sass.compileString(inputContent);
      return async (data) => {
        return result.css;
      };
    }
  });

  eleventyConfig.addPassthroughCopy('favicons');
  eleventyConfig.addPassthroughCopy('images');
  eleventyConfig.addPassthroughCopy('CNAME');

  eleventyConfig.addFilter('formatDate', require('./filters/format-date.js'));
};