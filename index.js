let Parser = require("jison").Parser;

let grammar = {
    "comment": "Boolean Parser",

    "lex": {
        "rules": [

            // OPERATORS
            ["\\=", "return '=' "],
            ["\\≈", "return '≈' "],
            ["\\!\\=", "return '!=' "],
            ["\\>\\=", "return '>=' "],
            ["\\>", "return '>' "],
            ["\\<\\=", "return '<=' "],
            ["\\<", "return '<' "],
            ["[I,i][N,n]", "return 'IN' "],
            ["[L,l][I,i][K,k][E,e]", "return 'LIKE' "],
            ["[A,a][N,n][D,d]", "return '&' "],
            ["\\&", "return '&' "],
            ["[O,o][R,r]", "return '|' "],
            ["\\|", "return '|' "],
            // ["[N,n][O,o][T,t]", "return '!' "],
            // ["\\!", "return '!' "],
            ["\\(", "return '(' "],
            ["\\)", "return ')' "],
            ["\\[", "return '[' "],
            ["\\]", "return ']' "],
            ["\\,", "return ',' "],


            // CHARS
            ["\\s+", "/* skip whitespace */"],
            ["(false|False|FALSE|TRUE|True|true)", "return 'BOOLEAN' "],
            ["^`?([a-zA-Z_][a-zA-Z0-9_]{0,})`?", "return 'LITERAL' "],
            ["^\"([^\\\\\"]*(?:\\\\.[^\\\\\"]*)*)\"", "return 'DBLSTRING' "],
            ["^\'([^\\\\\']*(?:\\\\.[^\\\\\']*)*)\'", "return 'STRING' "],
            ["[0-9]+(?:\\.[0-9]+)?\\b", "return 'NUMBER' "],
            ["\\-", "return '-'"],

            // END
            ["$", "return 'EOF' "]
        ]
    },


    "operators": [
        ["left", "(", ")"],
        ["left", "[", "]"],
        // ["right", "!"],
        ["left", "&", "|"],
        ["left", ">", ">=", "<", "<="],
        ["left", "=", "!=", "≈"],
        ["left", "LIKE", "IN"]
    ],

    "bnf": {
        "RESULT": [
            ["YConditions EOF", `return $1`],
            ["YMember EOF", `return $1`]
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
                let tmp = {"bool": {"must_not": {"term": {}}}};
                tmp.bool.must_not.term[key] = value;
                return tmp
            })($1, $3)`],
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
            ["YMember & YMember", `$$ = [[$1, $3]]`],
            ["YMember | YMember", `$$ = [[$1], $3]`],
            ["YMemberList & YMember", `$$ = $1; $1[0].push($3)`],
            ["YMemberList | YMember", `$$ = $1; $1.push($3)`],
            ["YMember & YMemberList", `$$ = $3; $3[0].push($1)`],
            ["YMember | YMemberList", `$$ = $3; $3.push($1)`],
            ["( YMemberList )", `$$ = $2`],
            ["YMemberList | YMemberList", `$$ = (function(memList1, memList2){
                if(memList2[0].length == 1){
                    memList2[0] = memList2[0][0];
                }
                return memList1.concat(menList2)
            })($1, $3)`]
        ],

        "YConditions": [
            ["YMemberList", `$$ = (function(memberList){
                let tmp = {"bool": {}};
                // OR isn't exist in Conditions
                if(memberList.length === 1){
                    tmp.bool.must = [];
                    tmp.bool.filter = [];
                    
                    for (let member of memberList[0]){
                        if(member.match){
                            tmp.bool.must.push(member)
                        }else{
                            tmp.bool.filter.push(member)
                        }
                    }
                    
                    if(tmp.bool.must.length===0){delete tmp.bool.must};
                    if(tmp.bool.filter.length===0){delete tmp.bool.filter};
                }else{
                    tmp.bool.should = [];
                    
                    for(let item of memberList){
                    
                        if(Array.isArray(item)){
                            if(item.length > 1){
                                innerTmp = {}
                                innerTmp.must = [];
                                innerTmp.filter = [];
                                
                                for (let member of item){
                                    if(item.match){
                                        innerTmp.must.push(member)
                                    }else{
                                        innerTmp.filter.push(member)
                                    }
                                }
                                
                                if(innerTmp.must.length===0){delete innerTmp.must};
                                if(innerTmp.filter.length===0){delete innerTmp.filter};
                            
                                tmp.bool["should"].push({"bool": innerTmp})
                            }else{
                                tmp.bool["should"].push(item[0])
                            }
                        }else{
                            tmp.bool["should"].push(item)    
                        }
                    }
                }
                return tmp
            })($1)`],

            ["YConditions & YConditions", `$$ = (function(con1, con2){
                return {"bool": {"must": [con1, con2]}}
            })($1, $3)`],
        ],

        "YConditionsList": [
            ["YConditions & YMember", `$$ = [[$1, $3]]`],
            ["YConditions | YMember", `$$ = [[$1], [$3]]`],
            ["YConditions & YMember", `$$ = $1; $1[0].push($3)`],
            ["YConditions | YMember", `$$ = $1; $1.push([$3])`]
        ]
    }
};

let parser = new Parser(grammar);

console.log(JSON.stringify(parser.parse(`
    SourceModuleName="ops_in1" and (Severity="INFO" OR Severity="INFO1") and Severity≈"INFO" 
`, true)));

module.exports = parser;
