/**
 * Decision Table class. Execute a group of rules
 * on a table.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import { FactsObject, Row } from './types';


class DecisionTable {

    private _factName: string;


    constructor() {
        this._factName = '';
        // pick up here
    }


    public setupFormat(arrTable: Array<Row>, importsObj: {}): void {

        // Create and operators class. Trool will first look if a condition is an operator in this
        // class. If it is not, it will look for a method
    }

    // create a method called checkFormat here, check for errors
    // throw error if first cell does not contain Start: factName
    // throw error if first
    // throw error when cell column title is not Condition or Action

    get factName(): string {
        return this._factName;
    }


    set factName(factName: string) {
        this._factName = factName;
    }


    public setData(factsObj: FactsObject): void {

        // set fact name here
        // set imports here
        // setup conditions and actions

    }


    public updateFacts(): any {
        // loops through array of facts for that factName

        // if cell string value is not a number first check to see if it's an import, if not
        // Trool will take it as just a regular string value
    }
}

export default DecisionTable;
