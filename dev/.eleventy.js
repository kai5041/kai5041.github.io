const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("assets");

    eleventyConfig.addGlobalData("pagination", {
    data: "languages",
    size: 1,
    alias: "lang"
  });

  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      const stem = data.page.filePathStem;

      const isIndex = stem === "index" || stem.endsWith("/index");

      const path = isIndex ? "" : `${stem}/`;

      return `/${data.lang}/${path}index.html`;
    }
  });

  eleventyConfig.addFilter("t", function (obj, lang) {
    return obj?.[lang] ?? obj?.en ?? "⚠️ missing";
  });

 return {
    dir: {
      input: ".",
      output: "../docs"
    }
  };
};
