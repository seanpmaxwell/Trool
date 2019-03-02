"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var csvtojson = require("csvtojson");
var simple_color_print_1 = require("simple-color-print");
var Trool = (function () {
    function Trool() {
    }
    Trool.prototype.applyRules = function (factsObject, filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var jsonArray, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4, csvtojson().fromFile(filePath)];
                    case 1:
                        jsonArray = _a.sent();
                        simple_color_print_1.cinfo(jsonArray);
                        return [3, 4];
                    case 2:
                        err_1 = _a.sent();
                        throw err_1;
                    case 3: return [2, {}];
                    case 4: return [2];
                }
            });
        });
    };
    return Trool;
}());
exports.default = Trool;
//# sourceMappingURL=Trool.js.map