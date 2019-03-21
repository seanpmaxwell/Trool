/**
 * Decision Table class. Execute a group of rules on a table. There are two categories of
 * operations: Condition operations and Action operations.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import TableErrs from './TableErrs';
import { ImportsObj, Row, parseCell } from './shared';


class DecisionTable {

    private readonly id: number;
    private readonly _factName: string;
    private readonly showLogs: boolean | undefined;
    private readonly tableErrs: TableErrs;

    private arrTable: Array<Row>;
    private importsObj: ImportsObj;
    private facts: InstanceType<any>[];
    private conditions: Function[];
    private actions: Function[];


    constructor(id: number, factName: string, showLogs?: boolean) {

        this.id = id;
        this._factName = factName;
        this.showLogs = showLogs;
        this.tableErrs = new TableErrs(id);

        this.arrTable = [];
        this.importsObj = {};
        this.facts = [];
        this.conditions = [];
        this.actions = [];
    }


    /**
     * The property on the FactsObj to be updated (i.e. Visitors)
     */
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

        // Get action/condition column header and operation string values
        const colHeaderArr = Object.values(arrTable[0]).map(header => header.trim().toLowerCase());
        const opsStrArr = Object.values(arrTable[1]).map(op => op.trim());

        if (colHeaderArr.length !== opsStrArr.length) {
            throw Error(this.tableErrs.colLenth);
        }

        let conditionsDone = false;
        this.conditions = [];
        this.actions = [];

        // Iterate through column headers and operations row
        for (let i = 1; i < colHeaderArr.length; i++) {

            if (colHeaderArr[i] === 'condition') {

                if (conditionsDone) {
                    throw Error(this.tableErrs.colHeaderArgmt);
                }

                const opFunc = this.getCondOps(opsStrArr[i]);
                this.conditions.push(opFunc);
                conditionsDone = (colHeaderArr[i + 1] === 'action');

            } else if (colHeaderArr[i] === 'action') {

                if (!conditionsDone) {
                    throw Error(this.tableErrs.colHeaderArgmt);
                }

                const actionFunc = this.getActionOps(opsStrArr[i]);
                this.actions.push(actionFunc);
                if (!colHeaderArr[i + 1]) { break; }

            } else {
                throw Error(this.tableErrs.colHeader);
            }
        }
    }


    private getCondOps(opStr: string): Function {

        return (factIdx: any, paramVal: any): boolean => {

            const fact = this.facts[factIdx];
            const arr = opStr.split(' ');
            const methodName = arr[0].replace('()', '');

            // Check condition format
            if (!opStr) {
                throw Error(this.tableErrs.condBlank);
            } else if (arr.length !== 3) {
                throw Error(this.tableErrs.opFormat);
            } else if (fact[methodName] === undefined) { // pick up here this is undefined
                throw Error(this.tableErrs.attrUndef(opStr));
            } else if (arr[2] !== '$param') {
                throw Error(this.tableErrs.mustEndWithParam);
            }

            // Call fact function or getter
            let attrVal = null;

            if (typeof fact[methodName] === 'function') {
                attrVal = fact[methodName]();
            } else if (typeof fact[methodName].get === 'function') {
                attrVal = fact[methodName].get();
            } else {
                throw Error(this.tableErrs.notFuncOrGetter);
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
            throw Error('Operator: ' + operator + ' is not a comparison operators');
        }
    }


    private getActionOps(actionStr: string): Function {

        return (factIdx: number, ...params: any[]): void => {

            const argLength = actionStr.split('$param').length - 1;

            if (!actionStr) {
                throw Error(this.tableErrs.actionOpEmpty);
            } else if (argLength !== params.length) {
                throw Error(this.tableErrs.paramCount);
            }

            const n = actionStr.lastIndexOf('(');
            const methodName = actionStr.substring(0, n);

            (this.facts[factIdx] as any)[methodName](...params);
        };
    }


    /*********************************************************************************************
     *                                  Update Facts
     ********************************************************************************************/

    public updateFacts(): Object[] {

        // Iterate facts
        for (let h = 0; h < this.facts.length; h++) {

            // Iterate rows
            for (let i = 2; i < this.arrTable.length - 1; i++) {

                const ruleArr = Object.values(this.arrTable[i]).map(cell => cell.trim());

                if (ruleArr[0] === '') {
                    throw Error(this.tableErrs.ruleNameEmpty);
                }

                let j;

                // iterate conditions
                for (j = 1; j < this.conditions.length; j++) {
                    const condPassed = this.callCondOp(h, j - 1, ruleArr[j]);
                    if (!condPassed) { return this.facts; }
                }

                // iterate actions
                for (; j < this.actions.length; j++) {
                    const actionIdx = j - this.actions.length;
                    this.callActionOp(h, actionIdx, ruleArr[j]);
                }
            }
        }

        return this.facts;
    }


    private callCondOp(factIdx: number, condIdx: number, cellValStr: string): boolean {

        // Don't check condition if cell is empty
        if (cellValStr === '') {
            return true;
        }

        const retVal = parseCell(cellValStr, this.importsObj); // pick up here

        if (retVal === null) {
            throw Error(this.tableErrs.invalidVal(this.id, cellValStr));
        }

        return this.conditions[condIdx](factIdx, retVal);
    }


    private callActionOp(factIdx: number, actionIdx: number, cellValStr: string): void {

        // Don't call action if cell is empty
        if (cellValStr === '') {
            return;
        }

        const cellVals = cellValStr.split(',');

        for (let i = 0; i < cellVals.length; i++) {
            cellVals[i] = parseCell(cellVals[i], this.importsObj);
        }

        this.actions[actionIdx].apply(factIdx, cellVals);
    }
}

export default DecisionTable;
