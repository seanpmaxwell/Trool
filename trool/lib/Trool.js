"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var csvtojson = require("csvtojson");
var simple_color_print_1 = require("simple-color-print");
var Trool = (function () {
    function Trool() {
        this._FACT_FORMAT_ERR = 'End of fact reached without a start';
    }
    Trool.prototype.applyRules = function (factsObject, filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var updatedFacts, jsonArr, factArr, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updatedFacts = {};
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, csvtojson().fromFile(filePath)];
                    case 2:
                        jsonArr = _a.sent();
                        factArr = this._iterateArr(jsonArr);
                        return [2, factArr];
                    case 3:
                        err_1 = _a.sent();
                        throw err_1;
                    case 4: return [2];
                }
            });
        });
    };
    Trool.prototype._iterateArr = function (jsonArr) {
        var factArr = [];
        var factStart = -1;
        var factEnd = -1;
        for (var i = 0; i < jsonArr.length; i++) {
            var field1 = jsonArr[i].field1;
            if (field1.includes('Start: ')) {
                factStart = i;
            }
            else if (field1 === 'End') {
                if (factStart === -1) {
                    throw Error(this._FACT_FORMAT_ERR);
                }
                else {
                    factEnd = i;
                }
            }
            if (factStart !== -1 && factEnd !== -1) {
                var fact = jsonArr.slice(factStart, factEnd);
                factArr.push(fact);
                factStart = -1;
                factEnd = -1;
            }
        }
        return factArr;
    };
    Trool.prototype._processFacts = function (factArr) {
        simple_color_print_1.cinfo(factArr);
        return {};
    };
    return Trool;
}());
exports.default = Trool;
//# sourceMappingURL=Trool.js.map