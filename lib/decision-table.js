"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rowToArr = exports.getNewDecisionTbl = void 0;
var shared_1 = require("./shared");
var errors = {
    colHeader: 'Action/Condition column headers can only be "Condition" or "Action".',
    colHeaderArgmt: 'All conditions must be specified before all actions',
    opBlank: 'Operation cannot be blank',
    opFormat: 'The operation must began with the Fact\'s attribute, contain one operator, and ' +
        'end with "$param". Operation:',
    attrUndef: 'Attribute does not exist on the fact for operation:',
    mustEndWithParam: 'Condition operation must end with "$param". Operation:',
    paramCount: 'The number of params for an action operation must match the number of argument ' +
        'for the method:',
    assignParamCount: 'An assignment action operation can only contain one argument. Assignment:',
    notAnOp: 'The following operator is not a comparison operator:',
};
function getNewDecisionTbl(factName, tableRows, logger) {
    var _a = getConditionsAndActions(tableRows, factName), conditions = _a.conditions, actions = _a.actions;
    return {
        factName: factName,
        tableRows: tableRows,
        conditions: conditions,
        actions: actions,
        logger: logger,
    };
}
exports.getNewDecisionTbl = getNewDecisionTbl;
function getConditionsAndActions(tableRows, factName) {
    var colHeaderArr = rowToArr(tableRows[0]);
    var opsStrArr = rowToArr(tableRows[1]);
    var conditionsDone = false;
    var conditions = [];
    var actions = [];
    for (var i = 1; i < colHeaderArr.length; i++) {
        if (colHeaderArr[i] === 'Condition') {
            if (conditionsDone) {
                throw new shared_1.TableError(factName, errors.colHeaderArgmt);
            }
            var condFunc = getCondOps(opsStrArr[i], factName);
            conditions.push(condFunc);
            conditionsDone = (colHeaderArr[i + 1] === 'Action');
        }
        else if (colHeaderArr[i] === 'Action') {
            if (!conditionsDone) {
                throw new shared_1.TableError(factName, errors.colHeaderArgmt);
            }
            var actionFunc = getActionOps(opsStrArr[i], factName);
            actions.push(actionFunc);
            if (!colHeaderArr[i + 1]) {
                break;
            }
        }
        else {
            throw new shared_1.TableError(factName, errors.colHeader);
        }
    }
    return { conditions: conditions, actions: actions };
}
function rowToArr(row) {
    return Object.values(row).map(function (cell) { return cell.trim(); });
}
exports.rowToArr = rowToArr;
;
function getCondOps(opStr, factName) {
    return function (fact, paramVal) {
        var arr = opStr.split(' ');
        var property = arr[0].replace('()', '');
        if (!opStr) {
            throw new shared_1.TableError(factName, errors.opBlank);
        }
        else if (arr.length !== 3) {
            throw new shared_1.TableError(factName, errors.opFormat + " \"".concat(opStr, "\""));
        }
        else if (fact[property] === undefined) {
            throw new shared_1.TableError(factName, errors.attrUndef + " \"".concat(opStr, "\""));
        }
        else if (arr[2] !== '$param') {
            throw new shared_1.TableError(factName, errors.mustEndWithParam + " \"".concat(opStr, "\""));
        }
        var attrVal = null;
        if (typeof fact[property] === 'function') {
            attrVal = fact[property]();
        }
        else {
            attrVal = fact[property];
        }
        return compareVals(arr[1], attrVal, paramVal, factName);
    };
}
function compareVals(operator, val1, val2, factName) {
    if (operator === '===') {
        return val1 === val2;
    }
    else if (operator === '==') {
        return val1 === val2;
    }
    else if (operator === '!=') {
        return val1 !== val2;
    }
    else if (operator === '!==') {
        return val1 !== val2;
    }
    else if (operator === '>') {
        return val1 > val2;
    }
    else if (operator === '>=') {
        return val1 >= val2;
    }
    else if (operator === '<') {
        return val1 < val2;
    }
    else if (operator === '<=') {
        return val1 <= val2;
    }
    else {
        throw new shared_1.TableError(factName, errors.notAnOp + " '".concat(operator, "'"));
    }
}
function getActionOps(actionStr, factName) {
    if (!actionStr) {
        throw new shared_1.TableError(factName, errors.opBlank);
    }
    return function (fact, cellVals) {
        var argLength = actionStr.split('$param').length - 1;
        var op = " \"".concat(actionStr, "\"");
        if (argLength !== cellVals.length) {
            throw new shared_1.TableError(factName, errors.paramCount + op);
        }
        var opArr = actionStr.split(' ');
        if (opArr[1] === '=') {
            if (cellVals.length !== 1) {
                throw new shared_1.TableError(factName, errors.assignParamCount + op);
            }
            else if (fact[opArr[0]] === undefined) {
                throw new shared_1.TableError(factName, errors.attrUndef + op);
            }
            fact[opArr[0]] = cellVals[0];
        }
        else {
            var n = actionStr.lastIndexOf('(');
            var methodName = actionStr.substring(0, n);
            if (fact[methodName] === undefined) {
                throw new shared_1.TableError(factName, errors.attrUndef + op);
            }
            fact[methodName].apply(fact, cellVals);
        }
    };
}
