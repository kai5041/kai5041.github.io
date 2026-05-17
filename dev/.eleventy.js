const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml", contents => yaml.load(contents));
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));


  eleventyConfig.addPassthroughCopy("pages/js");
  eleventyConfig.addPassthroughCopy("pages/css");
  eleventyConfig.addPassthroughCopy("pages/fonts");
  eleventyConfig.addPassthroughCopy("pages/assets");
  eleventyConfig.addPassthroughCopy("pages/static");

  eleventyConfig.addGlobalData("founder", "Kai (解)");

  eleventyConfig.addGlobalData("pagination", {
    data: "languages",
    size: 1,
    alias: "lang"
  });

  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      const name = data.page.fileSlug;
      return `/${data.lang}/${name === "index" ? "" : name + "/"}index.html`;
    }
  });

  eleventyConfig.addNunjucksGlobal("link", (label, url, handle) => {
    return `<strong>${label}</strong>: <a href="${url}" target="_blank" rel="noopener noreferrer">${handle}</a>`;
  });

  eleventyConfig.addNunjucksShortcode("note", (keyObj, lang, text) => {
    const label = keyObj?.[lang] ?? keyObj?.en ?? "NOTE";
    const out = text?.[lang] ?? text?.en ?? "⚠️ missing";
    return `<p class="note">◆ <strong>${label}</strong><br>${out}</p>`;
  });


  eleventyConfig.addFilter("t", function (obj, lang) {
    return obj?.[lang] ?? obj?.en ?? `⚠️ missing`;
  });

  return {
    dir: {
      input: "pages",
      output: ".."
    }
  };
};
