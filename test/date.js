var assert = require('assert');
var Traverse = require('traverse');

exports.dateEach = function () {
    var obj = { x : new Date, y : 10, z : 5 };
    
    var counts = {};
    
    Traverse(obj).forEach(function (node) {
        var t = (node instanceof Date && 'Date') || typeof node;
        counts[t] = (counts[t] || 0) + 1;
    });
    
    assert.eql(counts, {
        object : 1,
        Date : 1,
        number : 2,
    });
};

exports.dateMap = function () {
    var obj = { x : new Date, y : 10, z : 5 };
    
    var res = Traverse(obj).map(function (node) {
        if (typeof node === 'number') this.update(node + 100);
    });
    
    assert.eql(res, { x : obj.x, y : 110, z : 5 });
};

