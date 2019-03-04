"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var csvtojson = require("csvtojson");
var simple_color_print_1 = require("simple-color-print");
var DecisionTable_1 = require("./DecisionTable");
var Trool = (function () {
    function Trool() {
        this._TABLE_FORMAT_ERR = 'End of rule block reached without a start';
        this._IMPORT_ERR_1 = 'First cell of spreadsheet must be "Imports"';
        this._IMPORT_ERR_2 = 'Spreadsheet contains a greater number of imports than what' +
            'was provided to the facts object.';
    }
    Trool.prototype.applyRules = function (factsObject, filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var jsonArr, importsObj, decisionTables, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, csvtojson().fromFile(filePath)];
                    case 1:
                        jsonArr = _a.sent();
                        importsObj = this._setupImportsObj(factsObject, jsonArr[0]);
                        decisionTables = this._setupDecisionTables(factsObject, jsonArr, importsObj);
                        return [2, this._updateFacts(decisionTables)];
                    case 2:
                        err_1 = _a.sent();
                        throw err_1;
                    case 3: return [2];
                }
            });
        });
    };
    Trool.prototype._setupImportsObj = function (factsObject, importRow) {
        var field0 = importRow.field0, field1 = importRow.field1;
        if (field0 !== 'Imports:') {
            throw Error(this._IMPORT_ERR_1);
        }
        var importsObj = {};
        var importsArr = field1.split(',');
        if (importsArr.length > factsObject.Imports.length) {
            throw Error(this._IMPORT_ERR_2);
        }
        importsArr.forEach(function (importStr, i) {
            importsObj[importStr] =
            ;
        });
        return importsObj;
    };
    Trool.prototype._setupDecisionTables = function (factsObject, jsonArr, importsObj) {
        var decisionTables = [];
        var tableStart = -1;
        var tableEnd = -1;
        for (var i = 0; i < jsonArr.length; i++) {
            var field1 = jsonArr[i].field1;
            if (field1.includes('Start: ')) {
                tableStart = i;
            }
            else if (field1 === 'End') {
                if (tableStart === -1) {
                    throw Error(this._TABLE_FORMAT_ERR);
                }
                else {
                    tableEnd = i;
                }
            }
            if (tableStart !== -1 && tableEnd !== -1) {
                var table = jsonArr.slice(tableStart, tableEnd);
                var decisionTable = new DecisionTable_1.default(i + 1);
                decisionTable.setFactsAndImports(factsObject, importsObj);
                decisionTable.initTable(table);
                decisionTables.push(decisionTable);
                tableStart = tableEnd = -1;
            }
        }
        simple_color_print_1.cinfo(decisionTables.length + ' decision table\\s found');
        return decisionTables;
    };
    Trool.prototype._updateFacts = function (decisionTables) {
        var updateFacts = {};
        return updateFacts;
    };
    return Trool;
}());
exports.default = Trool;
//# sourceMappingURL=Trool.js.map