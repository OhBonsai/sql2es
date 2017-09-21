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
            "filter": [
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
    },
    case4: `a≈'b'`,
    result4: {match: {a: "b"}},
    case5: `((a="b" and (a="b" AND a="b")) or a="b")`,
    result5: {
        "bool": {
            "should": [
                {"bool": {
                    "filter": [
                        {"term": {"a": "b"}},
                        {"term": {"a": "b"}},
                        {"term": {"a": "b"}}]}},
                {"term": {"a": "b"}
            }]
        }
    }
};

describe('Test Suite', function () {

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

    describe('Approximate Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result4), JSON.stringify(parser.parse(cases.case4)));
        });
    });

    describe('Complex Brackets Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result5), JSON.stringify(parser.parse(cases.case5)));
        });
    });
});