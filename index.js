const CompileParser = require("./lib/compiled_parser.js");
CompileParser.yy = require("./lib/core.js");
module.exports = CompileParser;