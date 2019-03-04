/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as csvtojson from 'csvtojson';
import { cinfo, cerr } from 'simple-color-print';
import { FactsObject, Row } from './types';
import DecisionTable from './DecisionTable';


class Trool {

    private readonly _TABLE_FORMAT_ERR = 'End of rule block reached without a start';
    private readonly _IMPORT_ERR_1 = 'First cell of spreadsheet must be "Imports"';
    private readonly _IMPORT_ERR_2 = 'Spreadsheet contains a greater number of imports than what' +
        'was provided to the facts object.';


    public async applyRules(factsObject: FactsObject, filePath: string): Promise<FactsObject> {

        try {
            const jsonArr = await csvtojson().fromFile(filePath);
            const importsObj = this._setupImports(factsObject, jsonArr[0]);
            const decisionTables = this._setupDecisionTables(factsObject, jsonArr, importsObj);
            return this._updateFacts(decisionTables);
        } catch (err) {
            throw err;
        }
    }


    private _setupImports(factsObject: FactsObject, importRow: Row): {} {

        let { field0, field1 } = importRow;

        // Spreadsheet's first row must be an
        // 'Imports' row
        if (field0 !== 'Imports:') {
            throw Error(this._IMPORT_ERR_1);
        }

        let importsObj = {} as any;
        let importsArr = field1.split(',');

        // Spreadsheet cannot specify more imports than what
        // was provided
        if (importsArr.length > factsObject.Imports.length) {
            throw Error(this._IMPORT_ERR_2);
        }

        importsArr.forEach((importStr, i) => {
            importsObj[importStr] = factsObject.Imports[i];
        });

        return importsObj;
    }


    /**
     * Get array of DecisionTable objects from spreadsheet data.
     */
    private _setupDecisionTables(factsObject: FactsObject, jsonArr: Array<Row>, importsObj: {}):
        DecisionTable[] {

        let decisionTables = [];
        let tableStart = -1;
        let tableEnd = -1;

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
                const decisionTable = new DecisionTable();
                decisionTable.setFacts(factsObject);
                decisionTable.initTable(table, importsObj);
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
    private _updateFacts(decisionTables: DecisionTable[]): FactsObject {

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
