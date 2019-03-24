/**
 * Decision Table class. Execute a group of rules on a table. There are two categories of
 * operations: Condition operations and Action operations.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import { ImportsObj, Row, parseCell, compareVals, valsToArr } from './shared';
import TableErrs from './TableErrs';


class DecisionTable {

    private readonly id: number;
    private readonly _factName: string;
    private readonly showLogs: boolean | undefined;
    private readonly errs: TableErrs;

    private arrTable: Array<Row>;
    private importsObj: ImportsObj;
    private facts: InstanceType<any>[];
    private conditions: Function[];
    private actions: Function[];


    constructor(id: number, factName: string, showLogs?: boolean) {

        this.id = id;
        this._factName = factName;
        this.showLogs = showLogs;
        this.errs = new TableErrs(id);

        this.arrTable = [];
        this.importsObj = {};
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

    public initTable(arrTable: Array<Row>, factsArr: Object[], importsObj: ImportsObj): void {

        this.arrTable = arrTable;
        this.facts = factsArr;
        this.importsObj = importsObj;

        const colHeaderArr = valsToArr(arrTable[0]);
        const opsStrArr = valsToArr(arrTable[1]);

        if (colHeaderArr.length !== opsStrArr.length) {
            throw Error(this.errs.colLenth);
        }

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
                throw Error(errs.condBlank);
            } else if (arr.length !== 3) {
                throw Error(errs.opFormat);
            } else if (fact[methodName] === undefined) {
                throw Error(errs.attrUndef(opStr));
            } else if (arr[2] !== '$param') {
                throw Error(errs.mustEndWithParam);
            }

            let attrVal = null;
            if (typeof fact[methodName] === 'function') {
                attrVal = fact[methodName]();
            } else  {
                attrVal = fact[methodName];
            }

            return compareVals(arr[1], attrVal, paramVal);
        };
    }


    private getActionOps(actionStr: string): Function {

        const outer = this;
        const errs = this.errs;

        return (factIdx: number, cellVals: any[]): void => {

            const argLength = actionStr.split('$param').length - 1;

            if (argLength !== cellVals.length) {
                throw Error(errs.paramCount + actionStr);
            }

            const opArr = actionStr.split(' ');
            const fact = outer.facts[factIdx];

            // assignment or call method
            if (opArr.length === 3 && opArr[1] === '=') {

                if (argLength !== cellVals.length) {
                    throw Error(errs.assignParamCount + actionStr);
                }

                fact[opArr[0]] = cellVals[0];

            } else {
                const n = actionStr.lastIndexOf('(');
                const methodName = actionStr.substring(0, n);

                fact[methodName](...cellVals);
            }
        };
    }


    /*********************************************************************************************
     *                                  Update Facts
     ********************************************************************************************/

    public updateFacts(): Object[] {

        // Iterate facts
        for (let factIdx = 0; factIdx < this.facts.length; factIdx++) {

            // Iterate rows
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

        const retVal = parseCell(cellValStr, this.importsObj);

        if (retVal === null) {
            throw Error(this.errs.invalidVal(this.id, cellValStr));
        }

        return this.conditions[condIdx](factIdx, retVal);
    }


    private callActionOp(factIdx: number, actionIdx: number, cellValStr: string): void {

        if (cellValStr === '') {
            return;
        }

        const cellVals = cellValStr.split(',');

        for (let i = 0; i < cellVals.length; i++) {
            cellVals[i] = parseCell(cellVals[i], this.importsObj);
        }

        this.actions[actionIdx](factIdx, cellVals);
    }
}

export default DecisionTable;
