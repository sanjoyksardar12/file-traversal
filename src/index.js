"use strict";

const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const path = require("path");
exports.__esModule = true;

const map = [];


function getConntentAndFilename(filename) {
  let content;
  let actualFilename;
  try {
    if (!filename.endsWith(".js")) {
      content = fs.readFileSync(filename + ".js", "utf-8");
      actualFilename = filename + ".js";
    } else {
      content = fs.readFileSync(filename, "utf-8");
      actualFilename = filename;
    }
  } catch (err) {
    content = fs.readFileSync(filename + "/index.js", "utf-8");
    actualFilename = filename + "/index.js";
  };
  return { content, actualFilename };
}

function fetchFileContentAndItsDependencies(filename) {
  let { content, actualFilename } = getConntentAndFilename(filename);
  if (map.includes(actualFilename)) {
    return null;
  }
  map.push(actualFilename);

  const ast = parser.parse(content, {
    sourceType: "module",
    presets: [
      "@babel/react"
    ],
    plugins: [
      "classProperties",
      "jsx",
    ]
  });

  const dependencies = [];
  traverse(ast, {
    ImportDeclaration: function ({ node }) {
      if (node.source.value.startsWith(".") && !(node.source.value.endsWith(".css") || node.source.value.endsWith(".scss") || node.source.value.endsWith(".woff") || node.source.value.endsWith(".ttf"))) {
        dependencies.push(node.source.value);
      }
    },
    CallExpression: function ({ node }) {
      if (node.callee.name === "import") {
        console.log(node.arguments[0].value);
        dependencies.push(node.arguments[0].value);
      }
    }
  });
  return {
    filename: actualFilename,
    dependencies,
    content
  }
}

function checkMatchOption(asset, options, callback) {
  if (options.lineSearch === true) {
    const lines = asset.content.split("\n");
    lines.forEach(eachLine => {
      if (options.matchRegex.test(eachLine)) {
        callback(eachLine, asset.filename);
      }
    });
  }
}

exports.fileTraversal = function (entry, options, callback) {
  const entryAssets = fetchFileContentAndItsDependencies(entry);
  const queue = [entryAssets];
  for (const asset of queue) {
    checkMatchOption(asset, options, callback);
    const dirname = path.dirname(asset.filename);
    asset.dependencies.forEach(relativePath => {
      let absolutePath = path.join(dirname, relativePath);
      const child = fetchFileContentAndItsDependencies(absolutePath);
      if (child) {
        queue.push(child);
      }
    })
  }
}

