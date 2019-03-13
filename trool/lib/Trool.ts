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

    private readonly _showLogs: boolean | undefined;

    private readonly _TABLE_FORMAT_ERR = 'End of rule block reached without a start';
    private readonly _IMPORT_ERR_1 = 'First cell of spreadsheet must be "Imports"';


    constructor(showLogs?: boolean) {
        this._showLogs = showLogs;
    }


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

        const decisionTables = [];
        let tableStart = -1;
        let tableEnd = -1;

        // Iterate entire spreadsheet
        for (let i = 0; i < jsonArr.length; i++) {

            const { field1 } = jsonArr[i];

            // Get start and end rows for a table
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
                const decisionTable = new DecisionTable(i + 1, );
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

        const updateFacts = {} as any;

        // loop through array of decision tables
        // updatesFacts[table.getFactName] = table.updateFacts()

        return updateFacts;
    }
}

export default Trool;
