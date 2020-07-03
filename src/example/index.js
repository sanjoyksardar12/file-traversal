const { fileTraversal } = require("../index.js");
console.log(fileTraversal);

const allIcons = [];

function getIcons(line, filename) {
  const lineIcons = line.match(/ic(\-[a-zA-Z]+)+/ig);
  return lineIcons;
}

function matchedLine(line, filename) {
  console.log(line.trim());
  const icons = getIcons(line.trim(), filename);
  if (icons && icons.length) {
    allIcons.push(...icons);
  } else {
    console.log("Not able to parse icon for filename===>", filename, line);
  }
}
const entryPoint = "ABSOLUTE_URL";
fileTraversal(entryPoint, {
  lineSearch: true,
  matchRegex: /ic-/
}, matchedLine);
const filteredIcons = [...new Set(allIcons)];

console.log(filteredIcons.length, filteredIcons.sort());
