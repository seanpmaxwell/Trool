/**
 * Decision Table class. Execute a group of rules
 * on a table.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import { FactsObj, ImportsObj, Row } from './types';


class DecisionTable {

    // Setup Errors
    private readonly _START_CELL_ERR = 'Start cell must contain "Start:" and specify 1 and only ' +
        '1 fact.';
    private readonly _START_CELL_ERR_2 = 'Start cell must begin with "Start: "';
    private readonly _COND_RULE_ERR = 'Action/Condition column headers must start off with ' +
        'conditions and contain at least one condition.';
    private readonly _ACTION_RULE_ERR = 'Action/Condition column headers must end with an action.';
    private readonly _COL_HEADER_ERR = 'Action/Condition column headers can only be "Condition" ' +
        'or "Action"';
    private readonly _COL_HEADER_ARGMT_ERR = 'All conditions must specified before all actions';
    private readonly _LENGTH_ERR = 'The number of Action/Condition column headers must match ' +
        'and line up with the number of operations';

    // Setup class variables
    private readonly _id: string;
    private _importsObj: ImportsObj | null;
    private _factArr: Object[] | null;
    private _conditionsArr: Function[];
    private _actionsArr: Function[];


    constructor(id: number) {
        this._id = 'DecisionTable ' + id + ': ';
        this._importsObj = null;
        this._factArr = null;
        this._conditionsArr = [];
        this._actionsArr = [];
    }


    public initTable(arrTable: Array<Row>, factsObj: FactsObj, importsObj: ImportsObj): void {

        this._importsObj = importsObj;
        
        const colHeaderArr = Object.values(arrTable[0]);
        const operationsArr = Object.values(arrTable[1]);

        // Check for format errors and set facts
        const factName = this._checkFormatAndGetFactName(colHeaderArr, operationsArr);
        this._factArr = this._setupFactArr(factsObj[factName]);


        let conditionsDone = false;

        for (let i = 1; i < colHeaderArr.length; i++) {

            if (colHeaderArr[i] === 'Condition') {

                if (!conditionsDone) {
                    const opStr = operationsArr[i];
                    const opFunc = this._getConditionOp(opStr);
                    this._conditionsArr.push(opFunc);
                } else {
                    throw Error(this._id + this._COL_HEADER_ARGMT_ERR);
                }

                if (colHeaderArr[i + 1] === 'Action') {
                    conditionsDone = true;
                }

            } else if (colHeaderArr[i] === 'Action') {

                if (conditionsDone) {
                    this._actionsArr.push(new Function());
                    // pick up here, maybe add operation as well
                } else {
                    throw Error(this._id + this._COL_HEADER_ARGMT_ERR);
                }

            } else {
                throw Error(this._id + this._COL_HEADER_ERR);
            }
        }
    }


    private _checkFormatAndGetFactName(colHeaderArr: string[], operationsArr: string[]): string {

        const startCellArr = colHeaderArr[0].split(' ');

        if (startCellArr.length !== 2) {
            throw Error(this._id + this._START_CELL_ERR);
        } else if (startCellArr[0] !== 'Start:') {
            throw Error(this._id + this._START_CELL_ERR_2);
        } else if (colHeaderArr[1] !== 'Condition') {
            throw Error(this._id + this._COND_RULE_ERR);
        } else if (colHeaderArr[colHeaderArr.length - 1] !== 'Action') {
            throw Error(this._id + this._ACTION_RULE_ERR);
        } else if (colHeaderArr.length !== operationsArr.length) {
            throw Error(this._id + this._LENGTH_ERR);
        }

        return startCellArr[1];
    }


    private _setupFactArr(facts: Object | Object[]): Object[] {

        if (facts instanceof Array) {
            return facts;
        } else {
            return [facts];
        }
    }

    // later, when looping through rules, we want to fetch the operation at that index
    private _getConditionOp(opStr: string): Function {
        return (fact: Object, value: any) => {

            let arr = opStr.split(' ');
            let attr = arr[0];


            // throw error if attribute from operation string is not present on fact
            //
            // return boolean
        }
    }


    // loop through rule, pass value from rule to condition, in this method, determine if value
    // is from an import


    public updateFacts(): any {
        // loops through array of facts for that factName

        // if cell string value is not a number first check to see if it's an import, if not
        // Trool will take it as just a regular string value
    }
}

export default DecisionTable;
