"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jet_logger_1 = require("jet-logger");
var decision_table_1 = require("./decision-table");
var messages = {
    applyingRules: ' DecisionTables found. Applying table logic to facts.',
    warnings: {
        noTables: 'No decision tables found',
        importName: '!!WARNING!! The spreadsheet is using an import name already passed via ' +
            'the imports object. The spreadsheet will overwrite the import: ',
    },
    errors: {
        importStart: 'Import start format error for',
        importProp: 'Import property can only be alpha-numeric and underscores ',
        ruleNameEmpty: 'The rule name (first cell for a rule row for a decision table) cannot ' +
            'be empty.',
        invalidVal: 'The value provided in the table was not a null, boolean, number, string, ' +
            'or import. Cell value or values:',
        startCell: 'First cell must contain "Table:" and specify 1 and only 1 fact.',
    },
};
var logger = (0, jet_logger_1.JetLogger)();
function newEngine(showLogs, rows) {
    if (showLogs === false) {
        logger = (0, jet_logger_1.JetLogger)(jet_logger_1.LoggerModes.Off);
    }
    return {
        csvImports: setupImports(rows),
        decisionTables: getTables(rows),
        applyRules: applyRules,
    };
}
function setupImports(rows) {
    var imports = {};
    var importName = '';
    var newImportObj = {};
    for (var i = 0; i < rows.length; i++) {
        var firstCell = rows[i].field1.trim();
        if (firstCell.startsWith('Import:')) {
            importName = getImportName(firstCell, imports);
        }
        else if (!!importName) {
            if (!/^[a-zA-Z0-9-_]+$/.test(firstCell)) {
                throw Error(messages.errors.importProp + firstCell);
            }
            newImportObj[firstCell] = processValFromCell(rows[i].field2, imports);
            if (isLastRow(rows, i)) {
                imports[importName] = newImportObj;
                importName = '';
                newImportObj = {};
            }
        }
    }
    return imports;
}
function getImportName(firstCell, imports) {
    var firstCellArr = firstCell.split(' ');
    if (firstCellArr.length !== 2) {
        throw Error(messages.errors.importStart + " '".concat(firstCell, "'"));
    }
    var importName = firstCellArr[1];
    if (imports.hasOwnProperty(importName)) {
        logger.warn(messages.warnings.importName + importName);
    }
    return importName;
}
function getTables(rows) {
    var decisionTables = [];
    var startCellArr = null;
    var tableStart = -1;
    for (var i = 0; i < rows.length; i++) {
        var firstCol = rows[i].field1.trim();
        if (!!firstCol.startsWith('Table:')) {
            tableStart = i;
            startCellArr = getStartCellArr(firstCol);
        }
        else if (!!startCellArr && isLastRow(rows, i)) {
            var tableRows = rows.slice(tableStart, i + 1);
            var table = (0, decision_table_1.getNewDecisionTbl)(startCellArr[1], tableRows, logger);
            decisionTables.push(table);
            tableStart = -1;
            startCellArr = null;
        }
    }
    return decisionTables;
}
function getStartCellArr(firstCol) {
    var startCellArr = firstCol.split(' ');
    if (startCellArr.length !== 2) {
        throw Error(startCellArr[0] + ' ' + messages.errors.startCell);
    }
    return startCellArr;
}
function isLastRow(rows, idx) {
    var nextCell = (rows[idx + 1] ? rows[idx + 1].field1.trim() : '');
    return !nextCell || nextCell.startsWith('Table:') || nextCell.startsWith('Import:');
}
function applyRules(factsHolder, memImports) {
    var tableCount = this.decisionTables.length;
    if (tableCount === 0) {
        logger.warn(messages.warnings.noTables);
        return factsHolder;
    }
    else {
        logger.info(tableCount + messages.applyingRules);
    }
    var imports = combineImports(this.csvImports, memImports);
    var updatedFacts = {};
    for (var i = 0; i < tableCount; i++) {
        var table = this.decisionTables[i];
        var factVal = factsHolder[table.factName];
        var factArr = (factVal instanceof Array) ? factVal : [factVal];
        updatedFacts[table.factName] = updateFacts(table, factArr, imports);
    }
    return updatedFacts;
}
function combineImports(csvImports, memImports) {
    var allImports = {};
    for (var key in csvImports) {
        allImports[key] = csvImports[key];
    }
    for (var key in memImports) {
        allImports[key] = memImports[key];
    }
    return allImports;
}
function updateFacts(table, facts, imports) {
    var tableRows = table.tableRows, conditions = table.conditions, actions = table.actions;
    for (var factIdx = 0; factIdx < facts.length; factIdx++) {
        var fact = facts[factIdx];
        rowLoop: for (var rowIdx = 2; rowIdx < tableRows.length; rowIdx++) {
            var ruleArr = (0, decision_table_1.rowToArr)(tableRows[rowIdx]);
            if (ruleArr[0] === '') {
                throw Error(messages.errors.ruleNameEmpty);
            }
            var colIdx = 1;
            for (var i = 0; i < conditions.length; i++) {
                var passed = callCondOp(fact, conditions[i], ruleArr[colIdx++], imports);
                if (!passed) {
                    continue rowLoop;
                }
            }
            for (var i = 0; i < actions.length; i++) {
                callActionOp(fact, actions[i], ruleArr[colIdx++], imports);
            }
        }
    }
    return facts;
}
function callCondOp(fact, condition, cellValStr, imports) {
    if (cellValStr === '') {
        return true;
    }
    var retVal = processValFromCell(cellValStr, imports);
    if (retVal === null) {
        throw Error(messages.errors.invalidVal + " '".concat(cellValStr, "'"));
    }
    return condition(fact, retVal);
}
function callActionOp(fact, action, cellValStr, imports) {
    if (cellValStr === '') {
        return;
    }
    var cellVals = cellValStr.split(',');
    var retVals = [];
    for (var i = 0; i < cellVals.length; i++) {
        var val = processValFromCell(cellVals[i], imports);
        if (val === null) {
            throw Error(messages.errors.invalidVal + " '".concat(cellValStr, "'"));
        }
        else {
            retVals.push(val);
        }
    }
    action(fact, retVals);
}
function processValFromCell(cellValStr, imports) {
    cellValStr = cellValStr.trim();
    var cellValLowerCase = cellValStr.toLowerCase();
    if (!isNaN(Number(cellValStr))) {
        return Number(cellValStr);
    }
    else if (cellValLowerCase === 'true') {
        return true;
    }
    else if (cellValLowerCase === 'false') {
        return false;
    }
    else if (cellValLowerCase === 'null') {
        return null;
    }
    else if (cellValStr.startsWith('\'') && cellValStr.endsWith('\'')) {
        return cellValStr.substring(1, cellValStr.length - 1);
    }
    else if (cellValStr.startsWith('"') && cellValStr.endsWith('"')) {
        return cellValStr.substring(1, cellValStr.length - 1);
    }
    else if (cellValStr.startsWith('“') && cellValStr.endsWith('”')) {
        return cellValStr.substring(1, cellValStr.length - 1);
    }
    var importKey = cellValStr;
    var importVal;
    if (cellValStr.includes('.')) {
        var arr = cellValStr.split('.');
        importKey = arr[0];
        importVal = arr[1];
    }
    if (imports.hasOwnProperty(importKey)) {
        if (importVal) {
            return imports[importKey][importVal];
        }
    }
    return null;
}
;
exports.default = newEngine;
