let Parser = require("jison").Parser;

let grammar = {
    "comment": "Boolean Parser",

    "lex": {
        "rules": [
            // FUNCTION
            // ["TEST\\s*\(", "return 'TEST'"],

            // OPERATORS
            ["\\=", "return '=' "],
            ["\\≈", "return '≈' "],
            ["[Tt][Ee][Rr][Mm]", "return '=' "],
            ["[M,m][A,a][T,t][C,c][H,h]", "return '≈' "],
            ["\\!\\=", "return '!=' "],
            ["\\>\\=", "return '>=' "],
            ["\\>", "return '>' "],
            ["\\<\\=", "return '<=' "],
            ["\\<", "return '<' "],
            ["[I,i][N,n]", "return 'IN' "],
            ["[L,l][I,i][K,k][E,e]", "return 'LIKE' "],
            ["[A,a][N,n][D,d]", "return '*' "],
            ["\\*", "return '*' "],
            ["[O,o][R,r]", "return '+' "],
            ["\\+", "return '+' "],
            ["[N,n][O,o][T,t]", "return '~' "],
            ["\\~", "return '~' "],
            ["\\(", "return '(' "],
            ["\\)", "return ')' "],
            ["\\[", "return '[' "],
            ["\\]", "return ']' "],
            ["\\,", "return ',' "],


            // CHARS
            ["\\s+", "/* skip whitespace */"],

            ["[0-9]+(?:\\.[0-9]+)?\\b", "return 'NUMBER' "],
            ["(false|False|FALSE|TRUE|True|true)", "return 'BOOLEAN' "],
            ["^`?([a-zA-Z_][a-zA-Z0-9_]{0,})`?", "return 'LITERAL' "],
            ["^\"([^\\\\\"]*(?:\\\\.[^\\\\\"]*)*)\"", "return 'DBLSTRING' "],
            ["^\'([^\\\\\']*(?:\\\\.[^\\\\\']*)*)\'", "return 'STRING' "],
            ["\\-", "return '-'"],

            // END
            ["$", "return 'EOF' "]
        ]
    },


    "operators": [
        ["left", "(", ")"],
        ["left", "[", "]"],
        ["right", "~"],
        ["left", "*", "+"],
        ["left", ">", ">=", "<", "<="],
        ["left", "=", "!=", "≈"],
        ["left", "LIKE", "IN"]
    ],

    "bnf": {
        "RESULT": [
            ["YMember EOF", `return $1`],
            ["YMemberList EOF", `return (function(entry){
            
                function andHandler(result, andList){
                    for(let item of andList){
                        if(!Array.isArray(item)){
                            if(item.match){
                                result.bool.must.push(item)
                            }else{
                                result.bool.filter.push(item)
                            }
                        }else if(item.length === 1 && item[0].length === 1){
                            if(item.match){
                                result.bool.must.push(item[0][0])
                            }else{
                                result.bool.filter.push(item[0][0])
                            }
                        }else{
                            result.bool.must.push(recursion(item))
                        }
                    }
                    
                    if(result.bool.must!==undefined & result.bool.must.length === 0){delete result.bool.must}
                    if(result.bool.filter!==undefined & result.bool.filter.length === 0){delete result.bool.filter}
                }
            
                function orHandler(result, orList){
                    for(let item of orList){
                        if(!Array.isArray(item)){
                            result.bool.should.push(item)
                        }else if(item.length === 1 && item[0][0] && item[0][0].length === 1){
                            result.bool.should.push(item[0][0])
                        } else{
                            let must_tmp = {bool: {must: [], filter: []}};
                            andHandler(must_tmp, item);
                            if(must_tmp.bool.filter.length === 0){delete must_tmp.bool.filter}
                            result.bool.should.push(must_tmp)
                        }
                    }
                }
            
            
                function recursion(ll){
                    let top = {bool: {should: [], must: [], filter: []}};
                    
                    if(ll.length === 1){
                        andHandler(top, ll[0]);
                    }else{
                        orHandler(top, ll);
                    }
                    
                    
                    if(top.bool.should.length === 0){delete top.bool.should}
                    if(top.bool.must!==undefined && top.bool.must.length === 0){delete top.bool.must}
                    if(top.bool.filter!==undefined && top.bool.filter.length === 0){delete top.bool.filter}
                    
                    return top
                }
            
                return recursion(entry)
            })($1)`]
        ],

        "YString": [
            ["STRING", `$$ = yytext.slice(1, yytext.length-1)`],
            ["DBLSTRING", `$$ = yytext.slice(1, yytext.length-1)`],
            ["LITERAL", `$$ = yytext`]
        ],

        "YValue": [
            ["NUMBER", `$$ = Number(yytext)`],
            ["- NUMBER", `$$ = -Number($2)`],
            ["BOOLEAN", `$$ = yytext.toLowerCase()=='true' ? true : false`],
            ["YString", `$$ = $1`],
        ],

        "YStringList": [
            ["YString", `$$ = [$1]`],
            ["YStringList , YString", `$$ = $1; $1.push($3)`]

        ],

        "YArray": [
            ["[ ]", "$$ = []"], //frond end can't give me this option
            ["[ YStringList ]", `$$ = $2`]
        ],

        "YMember": [
            ["LITERAL ≈ YValue", `$$ = (function(key, value){
                let tmp = {"match": {}};
                tmp.match[key] = value;
                return tmp
            })($1, $3)`],
            ["LITERAL = YValue", `$$ = (function(key, value){
                let tmp = {"term": {}};
                tmp.term[key] = value;
                return tmp
            })($1, $3)`],
            ["LITERAL != YValue", `$$ = (function(key, value){
                let tmp = {"bool": {"must_not": [{"term": {}}]}};
                tmp.bool.must_not[0].term[key] = value;
                return tmp
            })($1, $3)`],
            ["~ YMember", `$$ = (function(key, value){
                let tmp = {"bool": {"must_not": [$2]}};
                return tmp
            })($2)`],
            ["LITERAL >= NUMBER", `$$ = (function(key, value){
                let tmp = {"range": {}};
                tmp.range[key] = {"gte": value};
                return tmp
            })($1, $3)`],
            ["LITERAL > NUMBER", `$$ = (function(key, value){
                let tmp = {"range": {}};
                tmp.range[key] = {"gt": value};
                return tmp
            })($1, $3)`],
            ["LITERAL <= NUMBER", `$$ = (function(key, value){
                let tmp = {"range": {}};
                tmp.range[key] = {"lte": value};
                return tmp
            })($1, $3)`],
            ["LITERAL < NUMBER", `$$ = (function(key, value){
                let tmp = {"range": {}};
                tmp.range[key] = {"lt": value};
                return tmp
            })($1, $3)`],
            ["LITERAL LIKE YString", `$$ = (function(key, value){
                let tmp = {"wildcard": {}};
                tmp.wildcard[key] = value;
                return tmp
            })($1, $3)`],
            ["LITERAL IN YArray", `$$ = (function(key, value){
                let tmp = {"terms": {}};
                tmp.terms[key] = value;
                return tmp
            })($1, $3)`],
            ["( YMember )", `$$ = $2`]
        ],

        "YMemberList": [
            ["YMember * YMember", `$$ = [[$1, $3]]`],
            ["YMember + YMember", `$$ = [[$1], $3]`],
            ["YMemberList * YMember", `$$ = $1; $1[0].push($3)`],
            ["YMemberList + YMember", `$$ = $1; $1.push($3)`],
            ["YMember * YMemberList", `$$ = $3; $3[0].push($1)`],
            ["YMember + YMemberList", `$$ = $3; $3.push($1)`],
            ["( YMemberList )", `$$ = $2`],
            ["YMemberList + YMemberList", `$$ = $1.concat($3)`],
            ["YMemberList * YMemberList", `$$ = [[$1, $3]]`],
        ]
    }
};

let parser = new Parser(grammar);
module.exports = parser;




