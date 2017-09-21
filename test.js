let assert = require('assert');
let parser = require('./index.js');

const cases = {
    case1: `a=b`,
    result1: {term: {a:"b"}},
    case2: `(a=b)`,
    result2: {term: {a:"b"}},
};

describe('Test Function', function() {

    describe('Simple YMember Test', function() {
        it(``, function() {
            assert.equal(JSON.stringify(cases.result1), JSON.stringify(parser.parse(cases.case1)));
        });
    });

    describe('Simple YMember With Bracket Test', function() {
        it(``, function() {
            assert.equal(JSON.stringify(cases.result2), JSON.stringify(parser.parse(cases.case2)));
        });
    });
});