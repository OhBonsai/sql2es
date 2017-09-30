const Parser = require("./src/grammer");
const fs = require("fs");
const path = require('path');

fs.writeFileSync('./lib/compiled_parser.js', Parser.generate());


let copy = function (src, dest) {
    let readStream = fs.createReadStream(src);
    let writeStream = fs.createWriteStream(dest);
    readStream.pipe(writeStream);
};

copy(path.join(__dirname, "src", "core.js"), path.join(__dirname, "lib", "core.js"));

