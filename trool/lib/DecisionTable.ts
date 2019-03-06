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

    // Setup class variables
    private _importsObj: ImportsObj | null;
    private _factArr: Object[] | null;
    private _condOpsArr: Function[] | null;
    private _actionOpsArr: Function[] | null;


    constructor(id: number) {
        this.tableErrs = new TableErrs(id);
        this._importsObj = null;
        this._factArr = null;
        this._condOpsArr = null;
        this._actionOpsArr = null;
    }


    public initTable(arrTable: Array<Row>, factsObj: FactsObj, importsObj: ImportsObj): void {

        this._importsObj = importsObj;

        // Get action/condition column header and operation string values
        const colHeaderArr = Object.values(arrTable[0]).map(header => header.trim().toLowerCase());
        const opsStrArr = Object.values(arrTable[1]).map(op => op.trim());

        // Check for format errors and set facts
        this._setFactArr(colHeaderArr, factsObj, opsStrArr.length);

        // Init array vars
        let conditionsDone = false;
        this._condOpsArr = [];
        this._actionOpsArr = [];

        // Iterate through column headers and operations row
        for (let i = 1; i < colHeaderArr.length; i++) {

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
     * Do some initial checking of the Condition/Action columns and set the Fact array.
     */
    private _setFactArr(colHeaderArr: string[], factsObj: FactsObj, numOfOps: number): void {

        const startCellArr = colHeaderArr[0].split(' ');

        if (startCellArr.length !== 2) {
            throw Error(this.tableErrs.startCell);
        } else if (startCellArr[0] !== 'start:') {
            throw Error(this.tableErrs.startCell2);
        } else if (colHeaderArr[1] !== 'condition') {
            throw Error(this.tableErrs.condRule);
        } else if (colHeaderArr[numOfOps - 1] !== 'action') {
            throw Error(this.tableErrs.actionColRule);
        } else if (colHeaderArr.length !== numOfOps) {
            throw Error(this.tableErrs.colLenth);
        }

        const factName = startCellArr[1];
        const facts = factsObj[factName];

        if (facts instanceof Array) {
            this._factArr = facts;
        } else {
            this._factArr = [facts];
        }
    }


    private _getCondOps(opStr: string): Function {

        return (fact: any, value: any): boolean => {

            const arr = opStr.split(' ');
            const attributeStr = arr[0];

            if (!opStr) {
                throw Error(this.tableErrs.condBlank);
            } else if (arr.length !== 3) {
                throw Error(this.tableErrs.opFormat);
            } else if (fact[attributeStr] === undefined) {
                throw Error(this.tableErrs.attrUndef(opStr));
            } else if (arr[2] !== '$param') {
                throw Error(this.tableErrs.mustEndWithParam);
            }

            return eval(`${fact[attributeStr]} ${arr[1]} ${value}`);
        }
    }


    private _getActionOps(actionStr: string): Function {

        return (fact: any, ...params: any[]): void => {

            const argLength = actionStr.split('$param').length - 1;

            if (!actionStr) {
                throw Error(this.tableErrs.actionOpEmpty)
            } else if (argLength !== params.length) {
                throw Error(this.tableErrs.paramCount)
            }

            const n = actionStr.lastIndexOf('(');
            const attrStr = actionStr.substring(0, n);

            fact[attrStr](...params);
        }
    }


    // loop through rows here, this method will use imports object, if attribute doesn
    // not exist on import throw error
    // return array of updated facts
    public updateFacts(): any {
        // loops through array of facts for that factName

        // if cell string value is not a number first check to see if it's an import, if not
        // Trool will take it as just a regular string value
    }
}

export default DecisionTable;
