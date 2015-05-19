var util = require('util');
var logger = require('pomelo-logger').getLogger('pomelo-config-reader', __filename);
var moment = require('moment');
/**
 * Tbl model `new Tbl()`
 *
 * @param {Array}
 *
 */
var Tbl = function(fileName, tmpL, idx, indexColumn) {
    var self = this;
    var fNameList = tmpL.splice(0, 1)[0];
    var fTypeList = tmpL.splice(0, 1)[0];
    if (indexColumn != undefined) {
        idx = fNameList[indexColumn];
    }
    var fieldsName = {};
    fNameList.forEach(function(value, index) {
        fieldsName[value] = index;
    });
    self.data = {};
    tmpL.forEach(function(item) {
        var obj = {};
        for (var k in fieldsName) {
            //obj[k] = item[fieldsName[k]];
            obj[k] = parseValue(item[fieldsName[k]], fTypeList[fieldsName[k]]);
        }
        if (self.data.hasOwnProperty(obj[idx])) {
            logger.error('Index column can not have duplicate value,please check the config file :%s', fileName + '.csv');
        } else {
            if (obj[idx]) {
                self.data[obj[idx]] = obj;
            } else {
                logger.error('No `%s` exists in tbl=%s', idx, util.inspect(fNameList, {
                    showHidden: false,
                    depth: 1
                }));
            }
        }
    });
};

var parseValue = function(value, type) {
    var strType = type.trim();
    switch (strType) {
        case "Int":
            var retVal = parseInt(value);
            if (isNaN(retVal)) {
                logger.error('parse :%s to :%s error!', value, type);
                return 0;
            }
            return retVal;
        case "Float":
            var retVal = parseFloat(value);
            if (isNaN(retVal)) {
                logger.error('parse :%s to :%s error!', value, type);
                return 0;
            }
            return retVal;
            break;
        case "String":
            return value;
        case "Boolean":
            return Boolean(value); // (false,"",0,NaN,null,undefined) is false ,else thing is true
        case "TS":
            if (!moment(value, "YYYY/MM/DD HH:mm", true).isValid()) {
                logger.error('parse :%s to :%s error!', value, type);
                return 0;
            }
            return Date.parse(value);
        case "Array4Int":
            var intList = value.split('#');
            if (intList.length == 0) {
                logger.error('error!the length of int[] is 0');
                return [];
            }
            var retVal = [];
            intList.map(function(num) {
                var tmp = parseInt(num);
                if (isNaN(tmp)) {
                    logger.error('error!the int[] contain NaN(Not a Number) value');
                }
                retVal.push(tmp);
            })
            return retVal;
        case "Array4String":
            var strList = value.split('#');
            if (strList.length == 0) {
                logger.error('error!the length of string[] is 0');
                return [];
            }
            var retVal = [];
            strList.map(function(str) {
                retVal.push(str);
            });
            return retVal;
        default:
            logger.error('unknown type detected :%s!', type);
    }
};
/**
 * find item by id
 *
 * @param id
 * @return {Obj}
 * @api public
 */
Tbl.prototype.findById = function(id) {
    return this.data[id];
};

/**
 * find item by function
 * @param func  provided testing function,accept a parameter 'element'
 * @return {Obj} first satisfies element
 * @api public
 */
Tbl.prototype.findByFunc = function(func) {
    for (var key in this.data) {
        if (func.call(null, this.data[key])) {
            return this.data[key];
        }
    }
    return undefined;
};
/**
 * find all item
 *
 * @return {array}
 * @api public
 */
Tbl.prototype.findAll = function() {
    return this.data;
};

///////////////////////////////////////////////////////
/**
 * Expose 'Tbl' constructor.
 */
module.exports = Tbl;