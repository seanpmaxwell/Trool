/**
 * Decision Table class. Execute a group of rules on a table. There are two categories of
 * operations: Condition operations and Action operations.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import { ImportsHolder, Row, Logger, parseCell, valsToArr } from './shared';
import TableErrs from './TableErrs';


class DecisionTable {

    private readonly id: number;
    private readonly _factName: string;
    private readonly logger: Logger;
    private readonly errs: TableErrs;

    private arrTable: Array<Row>;
    private imports: ImportsHolder;
    private facts: InstanceType<any>[];
    private conditions: Function[];
    private actions: Function[];


    constructor(id: number, factName: string, showLogs: boolean) {

        this.id = id;
        this._factName = factName;
        this.logger = new Logger(showLogs);
        this.errs = new TableErrs(id);

        this.arrTable = [];
        this.imports = {};
        this.facts = [];
        this.conditions = [];
        this.actions = [];
    }

    get factName() {
        return this._factName;
    }


    /*********************************************************************************************
     *                                  Initialize Table
     ********************************************************************************************/

    public initTable(arrTable: Row[], facts: InstanceType<any>[], imports: ImportsHolder): void {

        this.arrTable = arrTable;
        this.facts = facts;
        this.imports = imports;

        const colHeaderArr = valsToArr(arrTable[0]);
        const opsStrArr = valsToArr(arrTable[1]);

        let conditionsDone = false;
        this.conditions = [];
        this.actions = [];

        for (let i = 1; i < colHeaderArr.length; i++) {

            if (colHeaderArr[i] === 'Condition') {

                if (conditionsDone) {
                    throw Error(this.errs.colHeaderArgmt);
                }

                const condFunc = this.getCondOps(opsStrArr[i]);
                this.conditions.push(condFunc);
                conditionsDone = (colHeaderArr[i + 1] === 'Action');

            } else if (colHeaderArr[i] === 'Action') {

                if (!conditionsDone) {
                    throw Error(this.errs.colHeaderArgmt);
                }

                const actionFunc = this.getActionOps(opsStrArr[i]);
                this.actions.push(actionFunc);
                if (!colHeaderArr[i + 1]) { break; }

            } else {
                throw Error(this.errs.colHeader);
            }
        }
    }


    private getCondOps(opStr: string): Function {

        const outer = this;

        return (factIdx: any, paramVal: any): boolean => {

            const fact = outer.facts[factIdx];
            const errs = outer.errs;
            const arr = opStr.split(' ');
            const methodName = arr[0].replace('()', '');

            if (!opStr) {
                throw Error(errs.opBlank);
            } else if (arr.length !== 3) {
                throw Error(errs.opFormat + ` "${opStr}"`);
            } else if (fact[methodName] === undefined) {
                throw Error(errs.attrUndef + ` "${opStr}"`);
            } else if (arr[2] !== '$param') {
                throw Error(errs.mustEndWithParam + ` "${opStr}"`);
            }

            let attrVal = null;
            if (typeof fact[methodName] === 'function') {
                attrVal = fact[methodName]();
            } else  {
                attrVal = fact[methodName];
            }

            return this.compareVals(arr[1], attrVal, paramVal);
        };
    }


    private compareVals(operator: string, val1: any, val2: any): boolean {

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
            throw Error(this.errs.notAnOp + ` "${operator}"`);
        }
    }


    private getActionOps(actionStr: string): Function {

        if (!actionStr) {
            throw Error(this.errs.opBlank);
        }

        const outer = this;
        const errs = this.errs;

        return (factIdx: number, cellVals: any[]): void => {

            const argLength = actionStr.split('$param').length - 1;
            const op = ` "${actionStr}"`;

            if (argLength !== cellVals.length) {
                throw Error(errs.paramCount + op);
            }

            const opArr = actionStr.split(' ');
            const fact = outer.facts[factIdx];

            // check if assignment or method call
            if (opArr[1] === '=') {

                if (cellVals.length !== 1) {
                    throw Error(errs.assignParamCount + op);
                } else if (fact[opArr[0]] === undefined) {
                    throw Error(errs.attrUndef + op);
                }

                fact[opArr[0]] = cellVals[0];

            } else {

                const n = actionStr.lastIndexOf('(');
                const methodName = actionStr.substring(0, n);

                if (fact[methodName] === undefined) {
                    throw Error(errs.attrUndef + op);
                }

                fact[methodName](...cellVals);
            }
        };
    }


    /*********************************************************************************************
     *                                  Update Facts
     ********************************************************************************************/

    public updateFacts(): Object[] {

        for (let factIdx = 0; factIdx < this.facts.length; factIdx++) {

            rowLoop:
            for (let rowIdx = 2; rowIdx < this.arrTable.length; rowIdx++) {

                const ruleArr = valsToArr(this.arrTable[rowIdx]);

                if (ruleArr[0] === '') {
                    throw Error(this.errs.ruleNameEmpty);
                }

                let colIdx = 1;

                for (let i = 0; i < this.conditions.length; i++) {
                    const passed = this.callCondOp(factIdx, i, ruleArr[colIdx++]);
                    if (!passed) { continue rowLoop; }
                }

                for (let i = 0; i < this.actions.length; i++) {
                    this.callActionOp(factIdx, i, ruleArr[colIdx++]);
                }
            }
        }

        return this.facts;
    }


    private callCondOp(factIdx: number, condIdx: number, cellValStr: string): boolean {

        if (cellValStr === '') {
            return true;
        }

        const retVal = parseCell(cellValStr, this.imports);

        if (retVal === null) {
            throw Error(this.errs.invalidVal + ` "${cellValStr}"`);
        }

        return this.conditions[condIdx](factIdx, retVal);
    }


    private callActionOp(factIdx: number, actionIdx: number, cellValStr: string): void {

        if (cellValStr === '') {
            return;
        }

        const cellVals = cellValStr.split(',');

        for (let i = 0; i < cellVals.length; i++) {

            const val = parseCell(cellVals[i], this.imports);

            if (val === null) {
                throw Error(this.errs.invalidVal + ` "${cellValStr}"`);
            } else {
                cellVals[i] = val;
            }
        }

        this.actions[actionIdx](factIdx, cellVals);
    }
}

export default DecisionTable;
