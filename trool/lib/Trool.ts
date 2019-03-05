/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as csvtojson from 'csvtojson';
import { cinfo, cerr } from 'simple-color-print';
import { FactsObj, ImportsObj, Row } from './types';
import DecisionTable from './DecisionTable';


class Trool {

    private readonly _TABLE_FORMAT_ERR = 'End of rule block reached without a start';
    private readonly _IMPORT_ERR_1 = 'First cell of spreadsheet must be "Imports"';


    public async applyRules(filePath: string, factsObject: FactsObj, importsObj?: ImportsObj):
        Promise<FactsObj> {

        importsObj = importsObj || {};

        try {
            const jsonArr = await csvtojson().fromFile(filePath);
            const decisionTables = this._setupDecisionTables(jsonArr, factsObject, importsObj);
            return this._updateFacts(decisionTables);
        } catch (err) {
            throw err;
        }
    }


    /**
     * Get array of DecisionTable objects from spreadsheet data.
     */
    private _setupDecisionTables( jsonArr: Array<Row>, factsObject: FactsObj, importsObj:
        ImportsObj): DecisionTable[] {

        let decisionTables = [];
        let tableStart = -1;
        let tableEnd = -1;

        // Iterate entire spreadsheet
        for (let i = 0; i < jsonArr.length; i++) {

            const { field1 } = jsonArr[i];

            // Get indexes for a table
            if (field1.includes('Start: ')) {
                tableStart = i;
            } else if (field1 === 'End') {
                if (tableStart === -1) {
                    throw Error(this._TABLE_FORMAT_ERR);
                } else {
                    tableEnd = i;
                }
            }

            // Create new Decision Table
            if (tableStart !== -1 && tableEnd !== -1) {
                const table = jsonArr.slice(tableStart, tableEnd);
                const decisionTable = new DecisionTable(i+1);
                decisionTable.initTable(table, factsObject, importsObj);
                decisionTables.push(decisionTable);
                tableStart = tableEnd = -1;
            }
        }

        cinfo(decisionTables.length + ' decision table\\s found');
        return decisionTables;
    }

    /**
     * Update facts object, using the DecisionTable objects.
     */
    private _updateFacts(decisionTables: DecisionTable[]): FactsObj {

        let updateFacts = {} as any;

        // loop through array of decision tables
        // updatesFacts[table.getFactName] = table.updateFacts()

        return updateFacts;
    }
}

export default Trool;


// Operators to add
// Operators.push(new Operator('equal', (a, b) => a === b))
// Operators.push(new Operator('notEqual', (a, b) => a !== b))
// Operators.push(new Operator('in', (a, b) => b.indexOf(a) > -1))
// Operators.push(new Operator('notIn', (a, b) => b.indexOf(a) === -1))
// add isBetween here
//
// Operators.push(new Operator('contains', (a, b) => a.indexOf(b) > -1, Array.isArray))
// Operators.push(new Operator('doesNotContain', (a, b) => a.indexOf(b) === -1, Array.isArray))
//
// function numberValidator (factValue) {
//     return Number.parseFloat(factValue).toString() !== 'NaN'
// }
// Operators.push(new Operator('lessThan', (a, b) => a < b, numberValidator))
// Operators.push(new Operator('lessThanInclusive', (a, b) => a <= b, numberValidator))
// Operators.push(new Operator('greaterThan', (a, b) => a > b, numberValidator))
// Operators.push(new Operator('greaterThanInclusive', (a, b) => a >= b, numberValidator))
