exports.OpEqual = function(left, right){
    let tmp = {"term": {}};
    tmp.term[left] = right;
    return tmp
};