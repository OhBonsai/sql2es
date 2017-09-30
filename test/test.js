let assert = require('assert');
let parser = require('../index.js');

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
    result5: {"bool":{"should":[{"bool":{"filter":[{"term":{"a":"b"}},{"term":{"a":"b"}},{"term":{"a":"b"}}]}},{"term":{"a":"b"}}]}},
    case6: `system_platform in ["linux", "window"] `,
    result6: {"terms":{"system_platform":["linux","window"]}},
    case7: `system_platform Like "linu*" `,
    result7: {"wildcard":{"system_platform":"linu*"}},
    case8: `(a=b * a>=4) * (a=b * a>=4)`,
    result8: {"bool":{"must":[{"bool":{"filter":[{"term":{"a":"b"}},{"range":{"a":{"gte":"4"}}}]}},{"bool":{"filter":[{"term":{"a":"b"}},{"range":{"a":{"gte":"4"}}}]}}]}},
    case9: `~ a=b`,
    result9: {
        "bool": {
            "must_not": [
                {
                    "term": {
                        "a": "b"
                    }

                }
            ]
        }
    },
    case10: `a='10.201.81-&24'`,
    result10: {term: {a: "10.201.81-&24"}}
};

describe('Test Suite', function () {

    describe('1.Simple YMember Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result1), JSON.stringify(parser.parse(cases.case1)));
        });
    });

    describe('2.Negative Number Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result2), JSON.stringify(parser.parse(cases.case2)));
        });
    });

    describe('3.And Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result3), JSON.stringify(parser.parse(cases.case3)));
        });
    });

    describe('4.Approximate Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result4), JSON.stringify(parser.parse(cases.case4)));
        });
    });

    describe('5.Complex Brackets Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result5), JSON.stringify(parser.parse(cases.case5)));
        });
    });

    describe('6.In Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result6), JSON.stringify(parser.parse(cases.case6)));
        });
    });

    describe('7.Like Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result7), JSON.stringify(parser.parse(cases.case7)));
        });
    });

    describe('8.Complex And Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result8), JSON.stringify(parser.parse(cases.case8)));
        });
    });

    describe('9.Not Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result9), JSON.stringify(parser.parse(cases.case9)));
        });
    });

    describe('10.Special Char Test', function () {
        it(``, function () {
            assert.equal(JSON.stringify(cases.result10), JSON.stringify(parser.parse(cases.case10)));
        });
    });
});