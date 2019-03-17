/**
 * Decision Table class. Execute a group of rules on a table. There are two categories of
 * operations: Condition operations and Action operations.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import { FactsObj, ImportsObj, Row } from './types';
import TableErrs from './TableErrs';
import { parseCell } from './shared';


class DecisionTable {

    private readonly _id: number;
    private readonly _showLogs: boolean | undefined;
    private readonly tableErrs: TableErrs;

    private _arrTable: Array<Row>;
    private _importsObj: ImportsObj;
    private _factArr: Object[];
    private _condOpsArr: Function[];
    private _actionOpsArr: Function[];


    constructor(id: number, showLogs?: boolean) {

        this._id = id;
        this._showLogs = showLogs;
        this.tableErrs = new TableErrs(id);

        this._arrTable = [];
        this._importsObj = {};
        this._factArr = [];
        this._condOpsArr = [];
        this._actionOpsArr = [];
    }


    /*********************************************************************************************
     *                                  Initialize Table
     ********************************************************************************************/

    public initTable(arrTable: Array<Row>, factsArr: Object[], importsObj: ImportsObj): void {

        this._arrTable = arrTable;
        this._factArr = factsArr;
        this._importsObj = importsObj;

        // Get action/condition column header and operation string values
        const colHeaderArr = Object.values(arrTable[0]).map(header => header.trim());
        const opsStrArr = Object.values(arrTable[1]).map(op => op.trim());

        if (colHeaderArr.length !== opsStrArr.length) {
            throw Error(this.tableErrs.colLenth);
        }

        let conditionsDone = false;
        this._condOpsArr = [];
        this._actionOpsArr = [];

        // Iterate through column headers and operations row
        for (let i = 1; i < colHeaderArr.length; i++) {

            colHeaderArr[i] = colHeaderArr[i].toLowerCase();

            if (colHeaderArr[i] === 'condition') {

                if (!conditionsDone) {
                    const opFunc = this._getCondOps(opsStrArr[i]);
                    this._condOpsArr.push(opFunc);
                } else {
                    throw Error(this.tableErrs.colHeaderArgmt);
                }

                conditionsDone = (colHeaderArr[i + 1] === 'action');

            } else if (colHeaderArr[i] === 'action') {

                if (conditionsDone) {
                    const actionFunc = this._getActionOps(opsStrArr[i]);
                    this._actionOpsArr.push(actionFunc);
                } else {
                    throw Error(this.tableErrs.colHeaderArgmt);
                }

            } else {
                throw Error(this.tableErrs.colHeader);
            }
        }
    }


    private _getCondOps(opStr: string): Function {

        return (fact: any, value: any): boolean => {

            const arr = opStr.split(' ');
            const attrStr = arr[0].replace('()', '');

            // Check condition format
            if (!opStr) {
                throw Error(this.tableErrs.condBlank);
            } else if (arr.length !== 3) {
                throw Error(this.tableErrs.opFormat);
            } else if (!fact[attrStr]) {
                throw Error(this.tableErrs.attrUndef(opStr));
            } else if (arr[2] !== '$param') {
                throw Error(this.tableErrs.mustEndWithParam);
            }

            // Call fact function or getter
            let attrVal = null;

            if (typeof fact[attrStr] === 'function') {
                attrVal = fact[attrStr]();
            } else if (typeof fact[attrStr].get === 'function') {
                attrVal = fact[attrStr].get();
            } else {
                throw Error(this.tableErrs.notFuncOrGetter);
            }

            return this._determineOp(arr[1], attrVal, value);
        };
    }


    private _determineOp(operator: string, val1: any, val2: any): boolean {

        if (operator === '===') {
            return val1 === val2;
        } else if (operator === '==') {
            return val1 === val2;
        } else if (operator === '!=') {
            return val1 !== val2;
        } else if (operator === '!==') {
            return val1 !== val2;
        } else if (operator === '>') {
            return val1 > val2;
        } else if (operator === '>=') {
            return val1 >= val2;
        } else if (operator === '<') {
            return val1 < val2;
        } else if (operator === '<=') {
            return val1 <= val2;
        } else {
            throw Error('Operator not found');
        }
    }


    private _getActionOps(actionStr: string): Function {

        return (fact: any, ...params: any[]): void => {

            const argLength = actionStr.split('$param').length - 1;

            if (!actionStr) {
                throw Error(this.tableErrs.actionOpEmpty);
            } else if (argLength !== params.length) {
                throw Error(this.tableErrs.paramCount);
            }

            const n = actionStr.lastIndexOf('(');
            const attrStr = actionStr.substring(0, n);

            fact[attrStr](...params);
        };
    }


    /*********************************************************************************************
     *                                  Update Facts
     ********************************************************************************************/

    public updateFacts(): any {

        for (let h = 0; h < this._factArr.length; h++) {

            for (let i = 2; i < this._arrTable.length - 1; i++) {

                const ruleArr = Object.values(this._arrTable[i]).map(cell => cell.trim());
                const ruleName = ruleArr[0];

                if (ruleName === '') {
                    throw Error(this.tableErrs.ruleNameEmpty);
                }

                let conditionsPassed = false;

                // iterate conditions
                for (let j = 0; j < this._condOpsArr.length; j++) {
                    const cellVal = this._arrTable[i][j].trim();
                    conditionsPassed = this._callCondOp(h, j, cellVal);
                }

                // iterate actions
                if (conditionsPassed) {
                    for (let k = 0; k < this._actionOpsArr.length; k++) {

                        this._actionOpsArr[k]();
                    }
                }
            }
        }
    }


    private _callCondOp(factInt: number, condInt: number, cellValStr: string): boolean {

        const cellValParsed = parseCell(cellValStr);

        // If null check to see if Import Object, // pick up here put this in parseCell
        if (cellValParsed === null) {

            const importedObjStrArr = cellValStr.split('.');
            const name = importedObjStrArr[0];
            let cellVal;

            if (this._importsObj.hasOwnProperty(name)) {
                cellVal = this._importsObj[name];
            } else {
                throw Error(this.tableErrs.invalidVal(this._id, cellValStr));
            }
        }

        // throw error if not boolean number or imported object

        const val = cellValAlt !== undefined ? cellValAlt : cellVal;

        return this._condOpsArr[condInt](this._factArr[factInt], val);
    }
}

export default DecisionTable;
