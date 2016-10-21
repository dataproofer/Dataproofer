var Processing = require("./processing");
var Rendering = require("./rendering");

var pkg = require("./package.json");

module.exports = {
  Processing: Processing,
  Rendering: Rendering,
  version: pkg.version
};
