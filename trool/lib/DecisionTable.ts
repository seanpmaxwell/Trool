/**
 * Decision Table class. Execute a group of rules
 * on a table.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import { FactsObject, Row, Condition, Action } from './types';


class DecisionTable {

    private readonly _START_CELL_ERR = 'Start cell must contain "Start:" and specify 1 and only ' +
        '1 fact.';
    private readonly _START_CELL_ERR_2 = 'Start cell must begin with "Start: "';
    private readonly _COND_RULE_ERR = 'The table columns must start off with conditions and ' +
        'contain at least one condition';
    private readonly _COL_HEADER_ERR = 'Column headers for the DecisionTable can only be ' +
        '"Condition" or "Action"';
    private readonly _COL_HEADER_ARGMT_ERR = 'All conditions must specified before all actions';

    private readonly _id: string;
    private _factsObj: FactsObject | null;
    private _importsObj: {} | null;
    private _factName: string;
    private _conditionsArr: Condition[];
    private _actionsArr: Action[];


    constructor(id: number) {
        this._id = 'DecisionTable ' + id + ': ';
        this._factsObj = null;
        this._importsObj = null;
        this._factName = '';
        this._conditionsArr = [];
        this._actionsArr = [];
    }


    public setFactsAndImports(factsObject: FactsObject, importsObj: {}): void {
        this._factsObj = factsObject;
        this._importsObj = importsObj;
    }


    public initTable(arrTable: Array<Row>): void {

        this._initConditionAndActionArrays(arrTable);
        // Create and operators class. Trool will first look if a condition is an operator in this
        // class. If it is not, it will look for a method
    }


    private _initConditionAndActionArrays(arrTable: Array<Row>): void {

        const firstRow = arrTable[0];
        const { field0 } = firstRow;

        const startCellArr = field0.split(' ');

        // Check Start cell format
        if (startCellArr.length !== 2) {
            throw Error(this._id + this._START_CELL_ERR);
        } else if (startCellArr[0] !== 'Start: ') {
            throw Error(this._id + this._START_CELL_ERR_2);
        } else if (startCellArr[1] !== '') {
            // pick up here, make sure it is equal to a fact on the fact object
        } else {
            this.factName = startCellArr[1];
        }

        const firstRowArr = Object.values(firstRow);

        if (firstRowArr[1] !== 'Condition') {
            throw Error(this._id + this._COND_RULE_ERR);
        }

        let conditionsDone = false;

        // Iterate Conditions and Actions
        for (let i = 1; i < firstRowArr.length; i++) {

            if (firstRowArr[i] === 'Condition') {

                if (!conditionsDone) {
                    this._conditionsArr.push({
                        index: i,
                        operation: new Function() // pick up here, get the operation from the next row, use another method to handle this
                    });
                } else {
                    throw Error(this._id + this._COL_HEADER_ARGMT_ERR);
                }

                if (firstRowArr[i + 1] === 'Action') {
                    conditionsDone = true;
                }

            } else if (firstRowArr[i] === 'Action') {

                if (conditionsDone) {
                    this._actionsArr.push({index: i});
                    // pick up here, maybe add operation as well
                } else {
                    throw Error(this._id + this._COL_HEADER_ARGMT_ERR);
                }

            } else {
                throw Error(this._id + this._COL_HEADER_ERR);
            }
        }
    }


    get factName(): string {
        return this._factName;
    }


    set factName(factName: string) {
        this._factName = factName;
    }


    public updateFacts(): any {
        // loops through array of facts for that factName

        // if cell string value is not a number first check to see if it's an import, if not
        // Trool will take it as just a regular string value
    }
}

export default DecisionTable;
