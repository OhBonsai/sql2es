let assert = require('assert');
let parser = require('./index.js');

const cases = {
    case1: `a=b`,
    result1: {term: {a:"b"}}
};


describe('Test Function', function() {

    describe('Simple YMember test', function() {
        it(``, function() {
            assert.equal(JSON.stringify(cases.result1), JSON.stringify(parser.parse(cases.case1)));
        });
    });
});