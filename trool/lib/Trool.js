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
    }
    Trool.prototype.applyRules = function (filePath, factsObject, importsObj) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var jsonArr, decisionTables, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        importsObj = importsObj || {};
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, csvtojson().fromFile(filePath)];
                    case 2:
                        jsonArr = _a.sent();
                        decisionTables = this._setupDecisionTables(jsonArr, factsObject, importsObj);
                        return [2, this._updateFacts(decisionTables)];
                    case 3:
                        err_1 = _a.sent();
                        throw err_1;
                    case 4: return [2];
                }
            });
        });
    };
    Trool.prototype._setupDecisionTables = function (jsonArr, factsObject, importsObj) {
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
                decisionTable.initTable(table, factsObject, importsObj);
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