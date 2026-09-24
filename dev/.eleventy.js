const childProcess = require("node:child_process");
const path = require("node:path");
const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  const languages = ["en", "ja", "it", "ro"];

  const currencyByLanguage = {
    ja: "jpy",
    ro: "ron",
    en: "eur",
    it: "eur",
  };

  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("assets");

  eleventyConfig.addGlobalData("languages", languages);

  eleventyConfig.addGlobalData("pagination", {
    data: "languages",
    size: 1,
    alias: "lang",
  });

  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      const stem = data.page.filePathStem;

      const isIndex = stem === "index" || stem.endsWith("/index");
      const pagePath = isIndex ? "" : `${stem}/`;

      return `/${data.lang}/${pagePath}index.html`;
    },
  });

  eleventyConfig.addFilter("t", function (obj, lang) {
    return obj?.[lang] ?? obj?.en ?? "⚠️ missing";
  });

  const pricingFile = path.join(
    process.env.RAIREN_ROOT ?? "",
    "freelance",
    "pricings.ods",
  );

  function loadPricing() {
    try {
      return childProcess.execFileSync(
        "unzip",
        ["-p", pricingFile, "content.xml"],
        {
          encoding: "utf8",
          maxBuffer: 64 * 1024 * 1024,
        },
      );
    } catch {
      return null;
    }
  }

  function getXmlAttribute(attributes, name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const match = attributes.match(
      new RegExp(`${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`),
    );

    return match?.[1] ?? match?.[2] ?? null;
  }

  function parseCellAddress(address) {
    const match = address.match(
      /^(?:\$)?(?:'([^']+)'|([^.$]+))\.\$?([A-Z]+)\$?(\d+)$/,
    );

    if (!match) {
      return null;
    }

    return {
      sheet: match[1] ?? match[2],
      column: match[3],
      row: Number(match[4]),
    };
  }

  function columnToNumber(column) {
    let result = 0;

    for (const character of column) {
      result =
        result * 26 +
        character.charCodeAt(0) -
        "A".charCodeAt(0) +
        1;
    }

    return result;
  }

  function getCellFromSheet(sheetXml, column, row) {
    const targetColumn = columnToNumber(column);

    const rows = [
      ...sheetXml.matchAll(
        /<table:table-row\b([^>]*)>([\s\S]*?)<\/table:table-row>|<table:table-row\b([^>]*)\/>/g,
      ),
    ];

    const rowMatch = rows[row - 1];

    if (!rowMatch) {
      return null;
    }

    const rowContent = rowMatch[2] ?? "";

    const cells = [
      ...rowContent.matchAll(
        /<table:(table-cell|covered-table-cell)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/table:\1>)/g,
      ),
    ];

    let currentColumn = 1;

    for (const cell of cells) {
      const attributes = cell[2];
      const content = cell[3] ?? "";

      const repeated =
        Number(
          getXmlAttribute(
            attributes,
            "table:number-columns-repeated",
          ),
        ) || 1;

      if (
        targetColumn >= currentColumn &&
        targetColumn < currentColumn + repeated
      ) {
        const valueType = getXmlAttribute(
          attributes,
          "office:value-type",
        );

        const value = getXmlAttribute(
          attributes,
          "office:value",
        );

        if (value !== null) {
          if (valueType === "float" || valueType === "percentage") {
            return Number(value);
          }

          return value;
        }

        const text = content
          .replace(/<text:tab\s*\/>/g, "\t")
          .replace(/<text:line-break\s*\/>/g, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .trim();

        return text || null;
      }

      currentColumn += repeated;
    }

    return null;
  }

  function getCell(name) {
    if (!name) {
      return "⚠️ CELL NOT FOUND";
    }

    const pricingXml = loadPricing();

    if (!pricingXml) {
      return "⚠️ CELL NOT FOUND";
    }

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const rangeMatch = pricingXml.match(
      new RegExp(
        `<table:named-range\\b[^>]*table:name=["']${escapedName}["'][^>]*\\/?>`,
      ),
    );

    if (!rangeMatch) {
      return "⚠️ CELL NOT FOUND";
    }

    const address = getXmlAttribute(
      rangeMatch[0],
      "table:cell-range-address",
    );

    if (!address) {
      return "⚠️ CELL NOT FOUND";
    }

    const cell = parseCellAddress(address);

    if (!cell) {
      return "⚠️ CELL NOT FOUND";
    }

    const escapedSheet = cell.sheet.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    const sheetMatch = pricingXml.match(
      new RegExp(
        `<table:table\\b[^>]*table:name=["']${escapedSheet}["'][^>]*>([\\s\\S]*?)<\\/table:table>`,
      ),
    );

    if (!sheetMatch) {
      return "⚠️ CELL NOT FOUND";
    }

    const value = getCellFromSheet(
      sheetMatch[1],
      cell.column,
      cell.row,
    );

    return value ?? "⚠️ CELL NOT FOUND";
  }

  function getPrice(name, lang) {
    if (!name || !lang) {
      return "⚠️ CELL NOT FOUND";
    }

    const currency = currencyByLanguage[lang] ?? "eur";
    const value = getCell(`${name}_${currency}`);

    if (value === "⚠️ CELL NOT FOUND") {
      return value;
    }

    const number = Number(value);

    if (Number.isFinite(number)) {
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }).format(number);
    }

    return value;
  }

  eleventyConfig.addGlobalData("get_cell", () => getCell);
  eleventyConfig.addGlobalData("get_price", () => getPrice);

  return {
    dir: {
      input: "root",
      includes: "../templates",
      data: "../data",
      output: "../docs",
    },
  };
};

