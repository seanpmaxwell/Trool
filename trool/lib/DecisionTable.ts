/**
 * Decision Table class. Execute a group of rules on a table. There are two categories of
 * operations: Condition operations and Action operations.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import { FactsObj, ImportsObj, Row } from './types';
import TableErrs from './TableErrs';


class DecisionTable {

    private readonly tableErrs: TableErrs;

    private _arrTable: Array<Row>;
    private _importsObj: ImportsObj | null;
    private _factArr: Object[] | null;
    private _condOpsArr: Function[];
    private _actionOpsArr: Function[];


    constructor(id: number) {

        this.tableErrs = new TableErrs(id);

        this._arrTable = [];
        this._importsObj = null;
        this._factArr = null;
        this._condOpsArr = [];
        this._actionOpsArr = [];
    }


    public initTable(arrTable: Array<Row>, factsObj: FactsObj, importsObj: ImportsObj): void {

        this._arrTable = arrTable;
        this._importsObj = importsObj;

        // Get action/condition column header and operation string values
        const colHeaderArr = Object.values(arrTable[0]).map(header => header.trim());
        const opsStrArr = Object.values(arrTable[1]).map(op => op.trim());

        if (colHeaderArr.length !== opsStrArr.length) {
            throw Error(this.tableErrs.colLenth);
        }

        this._setFactArr(colHeaderArr[0], factsObj);

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


    /**
     * Do some initial checking of the Condition/Action columns and
     * set the Fact array.
     */
    private _setFactArr(startCell: string, factsObj: FactsObj): void {

        const startCellArr = startCell.split(' ');

        if (startCellArr.length !== 2) {
            throw Error(this.tableErrs.startCell);
        } else if (startCellArr[0] !== 'Start:') {
            throw Error(this.tableErrs.startCell2);
        }

        const factName = startCellArr[1];
        const facts = factsObj[factName];

        if (!factsObj[factName]) {
            throw Error(this.tableErrs.factFalsey);
        }

        if (facts instanceof Array) {
            this._factArr = facts;
        } else {
            this._factArr = [facts];
        }
    }


    private _getCondOps(opStr: string): Function {

        return (fact: any, value: any): boolean => {

            const arr = opStr.split(' ');
            const attrStr = arr[0].replace('()', '');

            if (!opStr) {
                throw Error(this.tableErrs.condBlank);
            } else if (arr.length !== 3) {
                throw Error(this.tableErrs.opFormat);
            } else if (!fact[attrStr]) {
                throw Error(this.tableErrs.attrUndef(opStr));
            } else if (arr[2] !== '$param') {
                throw Error(this.tableErrs.mustEndWithParam);
            }

            let attrVal = null;

            if (typeof fact[attrStr] === 'function') {
                attrVal = fact[attrStr]();
            } else if (typeof fact[attrStr].get === 'function') {
                attrVal = fact[attrStr].get();
            } else {
                throw Error(this.tableErrs.notFuncOrGetter);
            }

            return this._compare(arr[1], attrVal, value);
        };
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


    public updateFacts(): any {


        // pick up here, all this needs to be looped inside facts array


        for (let i = 2; i < this._arrTable.length - 1; i++) {

            const ruleArr = Object.values(this._arrTable[i]).map(cell => cell.trim());
            const ruleName = ruleArr[0];

            if (ruleName === '') {
                throw Error(this.tableErrs.ruleNameEmpty);
            }

            let applyActions = false;

            // iterate conditions
            for (let j = 1; j < this._condOpsArr.length; j++) {
                const cellVal = this._arrTable[i][j];
                this._condOpsArr[j](cellVal, cellVal);
            }

            // iterate actions
            for (let k = 1; k < this._actionOpsArr.length; k++) {

                this._actionOpsArr[k]();
            }
        }

        // if cell string value is not a number first check to see if it's an import, if not
        // Trool will take it as just a regular string value
    }


    /********************************************************************************
                                        Helpers
    ********************************************************************************/

    private _compare(operator: string, val1: any, val2: any): boolean {

        if (operator === '==') {
            return val1 === val2;
        } else if (operator === '===') {
            /* tslint:disable */
            return val1 == val2;
            /* tslint:enable */
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
}

export default DecisionTable;
