let assert = require('assert');
let parser = require('./index.js');

const cases = {
    case1: `a=b`,
    result1: {term: {a: "b"}},
    case2: `(a=-1)`,
    result2: {term: {a: -1}},
    case3: `(Keywords=-9214364837600034816 and Severity="INFO")`,
    result3: {
        "bool": {
            "must": [
                {
                    "term": {
                        "Keywords": -9214364837600034816
                    }
                },
                {
                    "term": {
                        "Severity": "INFO"
                    }
                }
            ]
        }
    }
};

describe('Test Function', function () {

    describe('Simple YMember Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result1), JSON.stringify(parser.parse(cases.case1)));
        });
    });

    describe('Negative Number Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result2), JSON.stringify(parser.parse(cases.case2)));
        });
    });

    describe('And Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result3), JSON.stringify(parser.parse(cases.case3)));
        });
    });
});